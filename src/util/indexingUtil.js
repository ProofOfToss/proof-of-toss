import { deserializeEvent } from './eventUtil';
import { fromBytes } from './serialityUtil';
import callAsync from './web3Util';
import util from 'util';
import { formatBalance } from './token'
import { decodeEventMethod } from './web3Util'

export const tagMapping = {
  'mappings': {
    'tag': {
      'properties': {
        'name': {'type': 'text'},
        'locale': {'type': 'keyword'},
      }
    },
  }
};

export const eventMapping = {
  'mappings': {
    'event': {
      'properties': {
        'name': {'type': 'text'},
        'description': {'type': 'text'},
        'bidType': {'type': 'keyword'},
        'address': {'type': 'keyword'},
        'createdBy': {'type': 'keyword'},
        'createdAt': {'type': 'date'},
        'locale': {'type': 'keyword'},
        'category': {'type': 'keyword'},
        'startDate': {'type': 'date'},
        'endDate': {'type': 'date'},
        'sourceUrl': {'type': 'text'},
        'bidSum': {'type': 'double'},
        'tag': {'type': 'nested'},

        'result': {'type': 'integer'},
        'possibleResults': {'type': 'object'},
        'bettor': {'type': 'keyword'},
        'withdrawn': {'type': 'keyword'},
      }
    },
  }
};

export const betMapping = {
  'mappings': {
    'bet': {
      'properties': {
        'event': {'type': 'keyword'},
        'eventResult': {'type': 'integer'},
        'index': {'type': 'integer'},
        'timestamp': {'type': 'date'},
        'bettor': {'type': 'keyword'},
        'result': {'type': 'integer'},
        'amount': {'type': 'double'},
        'withdrawn': {'type': 'keyword'},
      }
    },
  }
};

export class IndexingUtil {
  /**
   * @param EVENT_INDEX
   * @param TAG_INDEX
   * @param esClient
   * @param logger
   * @param web3
   * @param contractAPIs
   * @param forceRefresh
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
    this.indexTags = this.indexTags.bind(this);
    this.indexEvents = this.indexEvents.bind(this);
    this.updateEvents = this.updateEvents.bind(this);
  }

  /**
   * @param index
   * @param type
   * @param mapping
   * @param force
   * @returns {Promise.<void>}
   * @private
   */
  async _createIndex(index, type, mapping, force = false) {
    const indexExists = await this.esClient.indices.exists({index: index});
    if (indexExists && force) {
      await this._deleteIndex(index, type);
    }

    (indexExists && !force) || await this.esClient.indices.create({
      index: index,
      body: mapping,
    });
    (indexExists && !force) ? this.logger.info(`${type} index exists`) : this.logger.info(`${type} index created`);
  }

  /**
   * @param index
   * @param type
   * @returns {Promise.<void>}
   * @private
   */
  async _deleteIndex(index, type) {
    await this.esClient.indices.delete({index: index});
    this.logger.info(`${type} index deleted`);
  }

  /**
   * @param index
   * @param type
   * @param mapping
   * @returns {Promise.<void>}
   * @private
   */
  async _updateIndex(index, type, mapping) {
    await this.esClient.indices.putMapping({
      index: index,
      type: type,
      body: mapping.mappings[type],
    });
  }

  /**
   * @returns {Promise.<void>}
   */
  async syncIndeces(force = false) {
    await this._createIndex(this.TAG_INDEX, 'tag', tagMapping, force);
    await this._createIndex(this.EVENT_INDEX, 'event', eventMapping, force);
    await this._createIndex(this.BET_INDEX, 'bet', betMapping, force);

    await this._updateIndex(this.TAG_INDEX, 'tag', tagMapping);
    await this._updateIndex(this.EVENT_INDEX, 'event', eventMapping);
    await this._updateIndex(this.BET_INDEX, 'bet', betMapping);
  }

  /**
   * @param _event
   * @returns {Promise.<{name, description, bidType: (*|string|eventMapping.properties.bidType|{type}), bidSum: *, address: null, createdBy: *, locale, category, startDate, endDate, sourceUrl, tag, possibleResults: Array, result: *}>}
   */
  async convertBlockchainEventToEventDoc(_event) {
    try {
      const eventData = deserializeEvent(_event.eventData);
      const event = this.contractAPIs.EventBase.at(_event.eventAddress);

      const creator = await event.creator();
      const resultsCount = await event.resultsCount();
      const result = await event.resolvedResult();

      const promises = [];

      for (let i = 0; i < resultsCount; i++) {
        promises.push(event.possibleResults(i));
      }

      const possibleResults = (await Promise.all(promises)).map((result, i) => {return {
        'index': i,
        'customCoefficient': result[0],
        'betCount': result[1],
        'betSum': result[2],
        'description': eventData.results[i].description
      }});

      const bidSum = possibleResults.reduce((accumulator, result) => accumulator + parseInt(result.betSum, 10), 0);

      let tags = eventData.tags.map((tag) => { return {'locale': eventData.locale, 'name': tag}});

      return {
        'name': eventData.name,
        'description': eventData.description,
        'bidType': eventData.bidType,
        'bidSum': formatBalance(bidSum),
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

        body.push({ index: { _index: this.EVENT_INDEX, _type: 'event', _id: doc.address } });
        body.push(doc);

        this.indexTags(doc.tag);
      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    this.logger.trace(body);

    await this.esClient.bulk({body, refresh: this.forceRefresh}).then((result) => {
      this.logger.info(result.items);
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
        const transactionMethod = decodeEventMethod(transaction.input);

        let action;
        let betCount = 0;
        let rewardWithdrawn = false;

        switch (transactionMethod.name) {
          case 'transferToContract':
            action = 'newBet';

            let parsed = fromBytes(
              data,
              {type: 'uint', size: 256, key: 'betCount'},
            );

            betCount = parsed.parsedData.betCount;

            break;

          case 'resolve':
            action = 'resolve';
            break;

          case 'withdraw':
            action = 'withdraw';
            break;

          case 'withdrawPrize':
            action = 'withdrawPrize';
            break;

          case 'withdrawReward':
            action = 'withdrawReward';
            rewardWithdrawn = true;
            break;
        }

        const resultsCount = await event.resultsCount();
        const result = await event.resolvedResult();

        const promises = [];

        for (let i = 0; i < resultsCount; i++) {
          promises.push(event.possibleResults(i));
        }

        const possibleResults = (await Promise.all(promises)).map((result, i) => {return {
          'index': i,
          'betCount': result[1],
          'betSum': result[2],
        }});

        const bidSum = possibleResults.reduce((accumulator, result) => accumulator + parseInt(result.betSum, 10), 0);

        const doc = {
          'bidSum': formatBalance(bidSum),
          'result': result,
          'possibleResults': betCount > 0 ? possibleResults : [],
          'bettor': betCount > 0 ? [sender] : [],
          'rewardWithdrawn': rewardWithdrawn,
        };

        body.push({ update: { _index: this.EVENT_INDEX, _type: 'event', _id: address } });
        body.push({
          'script' : {
            'source': [
              'ctx._source.bidSum = params.bidSum',
              'ctx._source.result = params.result',
              rewardWithdrawn ? 'ctx._source.withdrawn = true' : '',
              'for (item in params.bettor) { if(!ctx._source.bettor.contains(item)) { ctx._source.bettor.add(item) } } for (item in params.possibleResults) { ctx._source.possibleResults[item.index].betCount = item.betCount; ctx._source.possibleResults[item.index].betSum = item.betSum; }',
            ].join(';'),
            'lang': 'painless',
            'params' : doc,
          }
        });

        if (betCount > 0) {
          const bet = await event.bets(betCount - 1);

          body.push({ index: { _index: this.BET_INDEX, _type: 'bet', _id: transactionHash } });
          body.push({
            event: address,
            index: betCount - 1,
            timestamp: bet[0],
            bettor: bet[1],
            result: bet[2],
            amount: formatBalance(bet[3]),
            withdrawn: false,
          });
        }

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    this.logger.trace(body);

    await this.esClient.bulk({body, refresh: this.forceRefresh}).then((result) => {
      this.logger.info(util.inspect(result.items, {showHidden: false, depth: 10}));
    }).catch((error) => {
      this.logger.error(error);
      throw error;
    });
  }
}
