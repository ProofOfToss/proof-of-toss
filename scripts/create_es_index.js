import appConfig from '../src/data/config.json';
import appPrivateConfig from '../src/data/private_config.json';
import {IndexingUtil} from '../src/util/indexingUtil';

import log4js from 'log4js';
const argv = require('yargs-parser')(process.argv.slice(2));

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const TAG_INDEX = 'toss_tag_' + appConfig.elasticsearch.indexPostfix;
const BET_INDEX = 'toss_bet_' + appConfig.elasticsearch.indexPostfix;

log4js.configure({
  appenders: {
    elasticsearch: { type: 'stdout' },
  },
  categories: { default: { appenders: ['elasticsearch'], level: 'debug' } }
});

const logger = log4js.getLogger('elasticsearch');

import {AwsEsPublicClient} from '../src/util/esClient';

const esClient = new AwsEsPublicClient(
  { log: 'error' },
  appConfig.elasticsearch.esNode,
  appConfig.elasticsearch.region,
  // appPrivateConfig.elasticsearch.accessKeyId,
  // appPrivateConfig.elasticsearch.secretAccessKey,
  appConfig.elasticsearch.useSSL
);

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

  const indexingUtil = new IndexingUtil(
    EVENT_INDEX,
    TAG_INDEX,
    BET_INDEX,
    esClient,
    logger,
    null,
    {}
  );

  const createIndex = async (force = false) => {
    try {
      await indexingUtil.syncIndeces(force);
    } catch (error) {
      fatal(error, 'failed to create/update index! exiting');
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

})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
