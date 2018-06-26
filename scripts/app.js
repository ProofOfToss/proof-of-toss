import appConfig from '../src/data/config.json';

import path from 'path';
import Web3 from 'web3';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import callAsync from '../src/util/web3Util';
import {getBuiltContract} from '../src/util/buildDir';
import EventWatcher from '../src/EventWatcher';

const tokenJson = getBuiltContract('Token');

import log4js from 'log4js';

log4js.configure({
  appenders: {
    elasticsearch: { type: 'file', filename: 'elasticsearch.log' },
    out: { type: 'stdout' },
  },
  categories: { default: { appenders: ['elasticsearch', 'out'], level: 'debug' } }
});

const logger = log4js.getLogger('elasticsearch');

import {AwsEsPublicClient} from '../src/util/esClient';

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const TAG_INDEX = 'toss_tag_' + appConfig.elasticsearch.indexPostfix;
const BET_INDEX = 'toss_bet_' + appConfig.elasticsearch.indexPostfix;

const esClient = new AwsEsPublicClient(
  { log: 'error' },
  appConfig.elasticsearch.esNode,
  appConfig.elasticsearch.region,
  appConfig.elasticsearch.useSSL
);

(async (callback) => {
  const web3 = new Web3();

  const config = Config.detect({'network': appConfig.network});
  const resolver = new Resolver(config);
  const provider = config.provider;

  const Main = resolver.require("../contracts/Main.sol");
  const EventBase = resolver.require("../contracts/EventBase.sol");
  const Token = resolver.require("../contracts/Token.sol");

  web3.setProvider(provider);

  Token.setProvider(provider);
  Main.setProvider(provider);
  EventBase.setProvider(provider);
  
  const coinbase = await callAsync(web3.eth.getCoinbase);
  
  Token.defaults({from: coinbase});
  Main.defaults({from: coinbase});
  EventBase.defaults({from: coinbase});

  web3.eth.defaultAccount = coinbase;

  /**
   * Emergency stop
   */
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

  await esClient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
  }).then(() => {
    logger.info('elasticsearch cluster is up');
  }).catch((error) => {
    fatal(error, 'elasticsearch cluster is down! exiting');
  });


  logger.info('Trying to resolve cache_state.json');

  const cacheStateFile = path.resolve(__dirname, 'cache_state.json');

  logger.info(`Network id: ${Token.network_id}`);
  logger.info(`Trying to find first block.`);

  const tokenTransactionHash = tokenJson.networks[Token.network_id].transactionHash;

  logger.info(`Token.transactionHash: ${tokenTransactionHash}.`);

  const firstBlock = (await callAsync(web3.eth.getTransactionReceipt.bind(web3.eth, tokenTransactionHash))).blockNumber;

  logger.info(`First block: #${firstBlock}`);

  const eventWatcher = new EventWatcher(
    EVENT_INDEX,
    TAG_INDEX,
    BET_INDEX,
    esClient,
    logger,
    web3,
    config,
    {
      Token,
      Main,
      EventBase,
    },
    appConfig.EventBase,
    cacheStateFile,
    firstBlock,
    true
  );
  await eventWatcher.initPromise;

  try {
    await eventWatcher.cacheEvents();
    await eventWatcher.cacheEventUpdates();

    eventWatcher.tryWatchEvents();
    eventWatcher.tryWatchEventUpdates();

    setInterval(() => {
      logger.info('Auto retry retryWatchEvents() and retryWatchEventUpdates() after 1 minute.');

      eventWatcher.tryWatchEvents();
      eventWatcher.tryWatchEventUpdates();
    }, 1000 * 20);
  } catch (err) {
    fatal(err);
  }
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error, 'Emergency stop'); });
