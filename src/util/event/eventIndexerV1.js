import { deserializeEvent } from './eventSerializerV1';
import { fromBytes } from '../serialityUtil';
import callAsync from '../web3Util';
import util from 'util';
import { formatBalance } from '../token'
import { decodeEventMethod } from '../web3Util'
import BigNumber from '../bignumber';

export default class EventIndexer {
  /**
   * @param {string}  EVENT_INDEX
   * @param {string}  TAG_INDEX
   * @param {string}  BET_INDEX
   * @param {object}  esClient
   * @param {object}  logger
   * @param {object}  web3
   * @param {object}  contractAPIs
   * @param {boolean} forceRefresh
   */
  constructor(EVENT_INDEX, TAG_INDEX, BET_INDEX, esClient, logger, web3, contractAPIs, forceRefresh = false) {
    this.EVENT_INDEX = EVENT_INDEX;
    this.TAG_INDEX = TAG_INDEX;
    this.BET_INDEX = BET_INDEX;

    this.esClient = esClient;
    this.logger = logger;
    this.web3 = web3;
    this.contractAPIs = contractAPIs;

    this.forceRefresh = forceRefresh;

    this.convertBlockchainEventToEventDoc = this.convertBlockchainEventToEventDoc.bind(this);
    this.indexEvents = this.indexEvents.bind(this);
    this.updateEvents = this.updateEvents.bind(this);
  }

  /**
   * @param _event
   * @returns {Promise.<{name, description, bidType: (*|string|eventMapping.properties.bidType|{type}), bidSum: *, address: null, createdBy: *, locale, category, startDate, endDate, sourceUrl, tag, possibleResults: Array, result: *}>}
   */
  async convertBlockchainEventToEventDoc (_event) {
    try {
      const eventData = deserializeEvent(_event.eventData);
      const event = this.contractAPIs.EventBase.at(_event.eventAddress);

      const creator = await event.creator();

      if (creator <= 0) {
        throw new Error('Failed to get event creator');
      }

      const resultsCount = await event.resultsCount();

      if (resultsCount <= 0) {
        throw new Error('Failed to get event resultsCount');
      }

      const result = await event.resolvedResult();

      if (result < 0) {
        throw new Error('Failed to get event result');
      }

      const deposit = await event.deposit();

      if (deposit <= 0) {
        throw new Error('Failed to get event deposit');
      }

      const promises = [];

      for (let i = 0; i < resultsCount; i++) {
        promises.push(event.possibleResults(i));
      }

      let possibleResults = (await Promise.all(promises)).map((result, i) => {
        return {
          'index': i,
          'customCoefficient': result[0],
          'betCount': result[1],
          'betSum': result[2],
          'description': eventData.results[i].description
        }
      });

      const bidSum = possibleResults.reduce(
        (accumulator, result) => accumulator.plus(new BigNumber(result.betSum)),
        new BigNumber(0)
      );

      possibleResults = possibleResults.map((result, i) => {
        return {
          ...result,
          'betSum': formatBalance(result.betSum)
        };
      });

      let tags = eventData.tags.map((tag) => { return {'locale': eventData.locale, 'name': tag}});

      return {
        'name': eventData.name,
        'description': eventData.description,
        'bidType': eventData.bidType,
        'bidSum': formatBalance(bidSum.toString()),
        'deposit': formatBalance(deposit),
        'address': _event.eventAddress,
        'createdBy': creator,
        'locale': eventData.locale,
        'category': eventData.category,
        'startDate': eventData.startDate,
        'endDate': eventData.endDate,
        'sourceUrl': eventData.sourceUrl,
        'tag': tags,
        'possibleResults': possibleResults,
        'result': result,
        'bettor': [],
        'withdrawn': false,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * @param tags
   * @returns {Promise.<void>}
   */
  async indexTags(tags) {
    if (tags.length === 0) return;

    let body = [];

    for(let i = 0; i < tags.length; i++) {
      body.push({ index: { _index: this.TAG_INDEX, _type: 'tag', _id: new Buffer(`${tags[i].locale} ${tags[i].name}`).toString('base64') } });
      body.push({ name: tags[i].name, locale: tags[i].locale });
    }

    this.logger.trace(body);

    await this.esClient.bulk({body, refresh: this.forceRefresh}).then((result) => {
      this.logger.info(result.items);
    }).catch((error) => {
      this.logger.error(error);
    });
  }

  /**
   * @param events
   * @returns {Promise.<void>}
   */
  async indexEvents(events) {
    if (events.length === 0) return;

    let body = [];

    for(let i = 0; i < events.length; i++) {
      try {
        const doc = await this.convertBlockchainEventToEventDoc(events[i].args);

        const block = await callAsync(this.web3.eth.getBlock.bind(this.web3.eth, events[i].blockNumber));
        doc.createdAt = block.timestamp;

        body.push({ create: { _index: this.EVENT_INDEX, _type: 'event', _id: doc.address } });
        body.push(doc);

        this.indexTags(doc.tag);
      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    this.logger.info('INDEX EVENTS');
    this.logger.info(body);

    await this.esClient.bulk({body, refresh: this.forceRefresh}).then((result) => {

      result.items.forEach(item => {
        this.logger.info('INDEX EVENTS ITEMS');
        this.logger.info(item);
        if (item.error) {
          this.logger.error(item.error);
        }
      })

    }).catch((error) => {
      this.logger.error(error);
      throw error;
    });
  }

  /**
   * @param events
   * @returns {Promise.<void>}
   */
  async updateEvents(events) {
    if (events.length === 0) return;

    let body = [];

    for(let i = 0; i < events.length; i++) {
      try {
        const address = events[i].args._contract;
        const data = events[i].args._data;
        const event = this.contractAPIs.EventBase.at(address);

        const transactionHash = events[i].transactionHash;
        const transaction = await callAsync(this.web3.eth.getTransaction.bind(this.web3.eth, transactionHash));
        const sender = transaction.from;
        const transactionMethod = decodeEventMethod(this.contractAPIs.EventBase, this.contractAPIs.Token, transaction.input);

        let action; // eslint-disable-line no-unused-vars
        let betCount = 0;
        let userBetIndex = 0;
        let rewardWithdrawn = false;
        let prizeWithdrawn = [];

        switch (transactionMethod.name) {
          case 'transferToContract':
            action = 'newBet';

            let parsed = fromBytes(
              data,
              {type: 'uint', size: 256, key: 'userBetIndex'},
              {type: 'uint', size: 256, key: 'betCount'},
            );

            betCount = parsed.parsedData.betCount;
            userBetIndex = parsed.parsedData.userBetIndex;

            break;

          case 'resolve':
            action = 'resolve';
            break;

          case 'withdraw':
            action = 'withdraw';
            const creator = await event.creator();

            if (creator.toUpperCase() === sender.toUpperCase()) {
              rewardWithdrawn = true;
            }

            const userBetsCount = await event.userBetsCount(sender);

            for (let i = 0, betIndex; i < userBetsCount; i++) {
              betIndex = await event.usersBets(sender, i);
              prizeWithdrawn.push(betIndex);
            }

            break;

          case 'withdrawPrize':
            action = 'withdrawPrize';
            const betIndex = await event.usersBets(sender, transactionMethod.params[0].value);
            prizeWithdrawn.push(betIndex);

            break;

          case 'withdrawReward':
            action = 'withdrawReward';
            rewardWithdrawn = true;
            break;

          default:
            break;
        }

        const resultsCount = await event.resultsCount();
        const result = await event.resolvedResult();

        const promises = [];

        for (let i = 0; i < resultsCount; i++) {
          promises.push(event.possibleResults(i));
        }

        let possibleResults = (await Promise.all(promises)).map((result, i) => {return {
          'index': i,
          'betCount': result[1],
          'betSum': result[2]
        }});

        const bidSum = possibleResults.reduce(
          (accumulator, result) => accumulator.plus(new BigNumber(result.betSum)),
          new BigNumber(0)
        );

        possibleResults = possibleResults.map((result, i) => {
          return {
            ...result,
            'betSum': formatBalance(result.betSum)
          };
        });

        const doc = {
          'bidSum': formatBalance(bidSum.toString()),
          'result': result,
          'possibleResults': possibleResults,
          'bettor': betCount > 0 ? [sender] : [],
          'withdrawn': rewardWithdrawn,
        };

        body.push({ update: { _index: this.EVENT_INDEX, _type: 'event', _id: address } });
        body.push({
          'script' : {
            'source': [
              'ctx._source.bidSum = params.bidSum;',
              'ctx._source.result = params.result;',
              rewardWithdrawn ? 'ctx._source.withdrawn = true;' : '',
              'for (item in params.bettor) { if(!ctx._source.bettor.contains(item)) { ctx._source.bettor.add(item) } } for (item in params.possibleResults) { ctx._source.possibleResults[item.index].betCount = item.betCount; ctx._source.possibleResults[item.index].betSum = item.betSum; }',
            ].join(''),
            'lang': 'painless',
            'params' : doc,
          }
        });

        this.logger.info('UPDATE EVENTS (doc)');
        this.logger.info(doc);

        if (betCount > 0) {
          const bet = await event.bets(betCount - 1);

          body.push({ index: { _index: this.BET_INDEX, _type: 'bet', _id: transactionHash } });
          body.push({
            event: address,
            index: betCount - 1,
            userIndex: userBetIndex - 1,
            timestamp: bet[0],
            bettor: bet[1],
            result: bet[2],
            amount: formatBalance(bet[3]),
            withdrawn: false,
          });
        }

        if (prizeWithdrawn.length > 0) {
          const res = await this.esClient.search(Object.assign({
            index: this.BET_INDEX,
          }, {
            body: {
              query: {
                bool: {
                  must: [
                    { term: { 'event': address } },
                    { terms: { 'index': prizeWithdrawn } },
                    { term: { 'bettor': sender } },
                  ]
                }
              }
            }
          }));

          for (let i = 0; i < res.hits.hits.length; i++) {
            body.push({ update: { _index: this.BET_INDEX, _type: 'bet', _id: res.hits.hits[i]._id } });
            body.push({
              doc: {
                withdrawn: true,
              }
            });
          }
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    this.logger.info('UPDATE EVENTS (body)');
    this.logger.info(body);

    await this.esClient.bulk({body, refresh: this.forceRefresh}).then((result) => {
      this.logger.info('UPDATE EVENTS (result)');
      this.logger.info(util.inspect(result.items, {showHidden: false, depth: 10}));
    }).catch((error) => {
      this.logger.error(error);
      throw error;
    });
  }
}