import appConfig from '../src/data/config.json';
import appPrivateConfig from '../src/data/private_config.json';

import log4js from 'log4js';
var argv = require('yargs-parser')(process.argv.slice(2));

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const TAG_INDEX = 'toss_tag_' + appConfig.elasticsearch.indexPostfix;

log4js.configure({
  appenders: {
    elasticsearch: { type: 'stdout' },
  },
  categories: { default: { appenders: ['elasticsearch'], level: 'debug' } }
});

const logger = log4js.getLogger('elasticsearch');

import AwsEsClient from '../src/util/esClient';

const esClient = new AwsEsClient(
  { log: 'error' },
  appConfig.elasticsearch.esNode,
  appConfig.elasticsearch.region,
  appPrivateConfig.elasticsearch.accessKeyId,
  appPrivateConfig.elasticsearch.secretAccessKey,
  appConfig.elasticsearch.useSSL
);

const tagMapping = {
  'properties': {
    'name': {'type': 'text'},
    'locale': {'type': 'keyword'},
  }
};

const eventMapping = {
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
  }
};

(async (callback) => {
  const fatal = function() {
    let _fatal = logger.fatal.bind(logger);

    for (let key in arguments) {
      if (arguments.hasOwnProperty(key)) {
        _fatal = _fatal.bind(logger, arguments[key]);
      }
    }

    _fatal();

    callback();
    process.exit(1);
  };

  const createIndex = async (force = false) => {
    try {
      let eventIndexExists = await esClient.indices.exists({index: EVENT_INDEX});
      let tagIndexExists = await esClient.indices.exists({index: TAG_INDEX});

      if (eventIndexExists && force) {
        await esClient.indices.delete({index: EVENT_INDEX});
        eventIndexExists = false;
        logger.info('event index deleted');
      }
      if (tagIndexExists && force) {
        await esClient.indices.delete({index: TAG_INDEX});
        tagIndexExists = false;
        logger.info('tag index deleted');
      }

      eventIndexExists || await esClient.indices.create({
        index: EVENT_INDEX,
        body: {
          'mappings': {
            'event': eventMapping,
          }
        },
      });
      eventIndexExists ? logger.info('event index exists') : logger.info('event index created');

      tagIndexExists || await esClient.indices.create({
        index: TAG_INDEX,
        body: {
          'mappings': {
            'tag': tagMapping,
          }
        },
      });
      eventIndexExists ? logger.info('tag index exists') : logger.info('tag index created');
    } catch (error) {
      fatal(error, 'failed to create index! exiting');
    }
  };

  const updateMappings = async () => {
    try {
      await esClient.indices.putMapping({
        index: TAG_INDEX,
        type: 'tag',
        body: tagMapping,
      });

      await esClient.indices.putMapping({
        index: EVENT_INDEX,
        type: 'event',
        body: eventMapping,
      });
    } catch (error) {
      fatal(error, 'failed to update mappings! exiting');
    }
  };

  await esClient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
  }).then(() => {
    logger.info('elasticsearch cluster is up');
  }).catch((error) => {
    fatal(error, 'elasticsearch cluster is down! exiting');
  });

  await createIndex(argv['force'] === true);
  await updateMappings();

})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
