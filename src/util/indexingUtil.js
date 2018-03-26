import { deserializeEvent } from './eventUtil';

export const tagMapping = {
  'properties': {
    'name': {'type': 'text'},
    'locale': {'type': 'keyword'},
  }
};

export const eventMapping = {
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
    'bidSum': {'type': 'integer'},
    'tag': {'type': 'nested'},

    'result': {'type': 'integer'},
    'possibleResults': {'type': 'object'},
    'bet': {'type': 'object'},
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
   * @param contractAPIs
   */
  constructor(EVENT_INDEX, TAG_INDEX, esClient, logger, web3, contractAPIs) {
    this.EVENT_INDEX = EVENT_INDEX;
    this.TAG_INDEX = TAG_INDEX;

    this.esClient = esClient;
    this.logger = logger;
    this.web3 = web3;
    this.contractAPIs = contractAPIs;

    this.convertBlockchainEventToEventDoc = this.convertBlockchainEventToEventDoc.bind(this);
    this.indexTags = this.indexTags.bind(this);
    this.indexEvents = this.indexEvents.bind(this);
    this.updateEvents = this.updateEvents.bind(this);
  }

  /**
   * @param force
   * @returns {Promise.<void>}
   */
  async createEventsIndex(force = false) {
    const eventIndexExists = await this.esClient.indices.exists({index: this.EVENT_INDEX});
    if (eventIndexExists && force) {
      await this.deleteEventsIndex();
    }

    (eventIndexExists && !force) || await this.esClient.indices.create({
      index: this.EVENT_INDEX,
      body: {
        'mappings': {
          'event': eventMapping,
        }
      },
    });
    (eventIndexExists && !force) ? this.logger.info('event index exists') : this.logger.info('event index created');
  }

  /**
   * @param force
   * @returns {Promise.<void>}
   */
  async createTagsIndex(force = false) {
    const tagIndexExists = await this.esClient.indices.exists({index: this.TAG_INDEX});

    if (tagIndexExists && force) {
      await this.deleteTagsIndex();
    }

    (tagIndexExists && !force) || await this.esClient.indices.create({
      index: this.TAG_INDEX,
      body: {
        'mappings': {
          'tag': tagMapping,
        }
      },
    });
    (tagIndexExists && !force) ? this.logger.info('tag index exists') : this.logger.info('tag index created');
  }

  /**
   * @returns {Promise.<void>}
   */
  async deleteEventsIndex() {
    await this.esClient.indices.delete({index: this.EVENT_INDEX});
    this.logger.info('event index deleted');
  }

  /**
   * @returns {Promise.<void>}
   */
  async deleteTagsIndex() {
    await this.esClient.indices.delete({index: this.TAG_INDEX});
    this.logger.info('tag index deleted');
  }

  /**
   * @returns {Promise.<void>}
   */
  async updateEventsIndex() {
    await this.esClient.indices.putMapping({
      index: this.TAG_INDEX,
      type: 'tag',
      body: tagMapping,
    });
  }

  /**
   * @returns {Promise.<void>}
   */
  async updateTagsIndex() {
    await this.esClient.indices.putMapping({
      index: this.EVENT_INDEX,
      type: 'event',
      body: eventMapping,
    });
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
        'bidSum': bidSum,
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
        'bet': [],
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

    await this.esClient.bulk({body}).then((result) => {
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

        const block = await this.web3.eth.getBlock(events[i].blockNumber);
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

    await this.esClient.bulk({body}).then((result) => {
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
        const sender = (await this.web3.eth.getTransaction(events[i].transactionHash)).from;

        const address = events[i].args._contract;
        const event = this.contractAPIs.EventBase.at(address);

        const resultsCount = await event.resultsCount();
        const result = await event.resolvedResult();

        const promises = [];

        for (let i = 0; i < resultsCount; i++) {
          promises.push(event.possibleResults(i));
        }

        const bidSum = (await Promise.all(promises)).reduce((accumulator, result) => accumulator + parseInt(result[3], 10), 0);

        const userBetIndexes = await event.getUserBets(sender);
        const userBets = await Promise.all(userBetIndexes.map((idx) => event.bets(idx)));

        const doc = {
          'bidSum': bidSum,
          'result': result,
          'bet': userBets.map((bet) => {
            return {
              timestamp: bet[0],
              bettor: bet[1],
              result: bet[2],
              amount: bet[3],
            };
          }),
        };

        body.push({ update: { _index: this.EVENT_INDEX, _type: 'event', _id: address } });
        body.push({
          'script' : {
            'source': [
              'ctx._source.bidSum = params.bidSum',
              'ctx._source.result = params.result',
              'for (item in params.bet) { if(!ctx._source.bet.contains(item)) { ctx._source.bet.add(item) } }'
            ].join(';'),
            'lang': 'painless',
            'params' : doc,
          }
        });

      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    this.logger.trace(body);

    await this.esClient.bulk({body}).then((result) => {
      this.logger.info(result.items);
    }).catch((error) => {
      this.logger.error(error);
      throw error;
    });
  }
}
