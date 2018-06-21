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
        'bidType': {'type': 'text'},
        'address': {'type': 'keyword'},
        'createdBy': {'type': 'keyword'},
        'createdAt': {'type': 'date'},
        'locale': {'type': 'keyword'},
        'category': {'type': 'keyword'},
        'startDate': {'type': 'date'},
        'endDate': {'type': 'date'},
        'sourceUrl': {'type': 'text'},
        'bidSum': {'type': 'double'},
        'deposit': {'type': 'double'},
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
        'userIndex': {'type': 'integer'},
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
   * @param {string}  EVENT_INDEX
   * @param {string}  TAG_INDEX
   * @param {string}  BET_INDEX
   * @param {object}  esClient
   * @param {object}  logger
   * @param {object}  web3
   * @param {boolean} forceRefresh
   */
  constructor(EVENT_INDEX, TAG_INDEX, BET_INDEX, esClient, logger, web3, forceRefresh = false) {
    this.EVENT_INDEX = EVENT_INDEX;
    this.TAG_INDEX = TAG_INDEX;
    this.BET_INDEX = BET_INDEX;

    this.esClient = esClient;
    this.logger = logger;
    this.web3 = web3;

    this.forceRefresh = forceRefresh;
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
}
