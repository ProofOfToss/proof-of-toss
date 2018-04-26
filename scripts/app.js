import appConfig from '../src/data/config.json';
import appPrivateConfig from '../src/data/private_config.json';

import fs from 'fs';
import path from 'path';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import {IndexingUtil} from '../src/util/indexingUtil';
import callAsync from '../src/util/web3Util';

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
  /*appPrivateConfig.elasticsearch.accessKeyId,
  appPrivateConfig.elasticsearch.secretAccessKey,*/
  appConfig.elasticsearch.useSSL
);

(async (callback) => {
  const web3 = new Web3();

  const config = Config.detect({'network': appConfig.network});
  const resolver = new Resolver(config);
  const provider = config.provider;

  // Import our contract artifacts and turn them into usable abstractions.
  // const token_artifacts = require('../build/contracts/Token.json');
  // const main_artifacts = require('../build/contracts/Main.json');
  // const event_artifacts = require('../build/contracts/Event.json');
  // const Token = contract(token_artifacts);
  // const Main = contract(main_artifacts);
  // const Event = contract(event_artifacts);
  // Это НЕ РАБОТАЕТ – дичайшие глюки

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


  const indexingUtil = new IndexingUtil(
    EVENT_INDEX,
    TAG_INDEX,
    BET_INDEX,
    esClient,
    logger,
    web3,
    {
      Token,
      Main,
      EventBase,
    }
  );

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

  let main, token, accounts, eventBase;

  await esClient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
  }).then(() => {
    logger.info('elasticsearch cluster is up');
  }).catch((error) => {
    fatal(error, 'elasticsearch cluster is down! exiting');
  });

  web3.eth.getAccounts((err, accs) => {
    if (err !== null) {
      fatal(err, "There was an error fetching your accounts.");
    }

    if (accs.length === 0) {
      fatal("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
    }

    accounts = accs;
  });

  try {
    main = await Main.deployed();
    token = await Token.deployed();
    eventBase = await EventBase.deployed();
  } catch (error) {
    fatal(error);
  }

  const cacheStateFile = path.resolve(__dirname, 'cache_state.json');

  /**
   * @param defaultState
   * @returns {*}
   */
  function readCacheState(defaultState) {
    if (fs.existsSync(cacheStateFile)) {
      try {
        const state = JSON.parse(fs.readFileSync(cacheStateFile, {encoding: "utf8"}));
        return Object.assign({}, defaultState, state);
      } catch (e) {
        logger.error(e);
        return defaultState;
      }
    } else {
      return defaultState;
    }
  }

  /**
   * @param cacheState
   * @returns {*}
   */
  function writeCacheState(cacheState) {
    return fs.writeFileSync(cacheStateFile, JSON.stringify(cacheState) + '\n');
  }

  let cacheState = readCacheState({lastBlock: appConfig.firstBlock, lastUpdateBlock: appConfig.firstBlock});
  const blockNumber = await callAsync(web3.eth.getBlockNumber);

  logger.info(`Caching events starting from block #${cacheState.lastBlock} to block #${blockNumber}`);

  const step = 10;

  for(let i = cacheState.lastBlock; i < blockNumber; i += step) {
    logger.info(`Caching events from block #${i}`);

    const events = main.NewEvent({}, {fromBlock: cacheState.lastBlock, toBlock: cacheState.lastBlock + step});

    try {
      const log = await callAsync(events.get.bind(events));

      try {
        await indexingUtil.indexEvents(log);
        cacheState.lastBlock = i;
        writeCacheState(cacheState);
      } catch (err) {
        fatal(err, `Error while caching events from block #${i}`);
      }
    } catch (error) {
      fatal(error, `Error while fetching events from block #${i}`);
    }
  }

  logger.info(`Events to block #${blockNumber} cached`);


  let watchEventRetryTimeout;
  let watchEventRetryPending = false;

  /**
   * @returns {number}
   */
  const watchEvents = () => {
    let events;

    const retry = async () => {
      if (watchEventRetryPending) {return;}
      watchEventRetryPending = true;

      clearTimeout(watchEventRetryTimeout);

      try {
        if (events && events.requestManager) {
          await callAsync(events.stopWatching.bind(events));
        }

      } catch (err) {
        logger.error(err);
      }

      watchEventRetryTimeout = setTimeout(() => {
        watchEventRetryPending = false;
        watchEvents();
      }, 1000);
    };

    try {
      logger.info(`Watching for new events`);

      events = main.NewEvent({}, {fromBlock: cacheState.lastBlock, toBlock: 'latest'});

      events.watch(async (error, response) => {
        if (error) {
          logger.error(error, `Error while watching for new events starting from block #${cacheState.lastBlock}`);
          return setTimeout(retry, 1000);
        }

        try {
          await indexingUtil.indexEvents([response]);
        } catch (err) {
          logger.error(err, `Error while indexing new event at block #${response.blockNumber}`);
          return setTimeout(retry, 1000);
        }

        cacheState.lastBlock = response.blockNumber - 1;
        writeCacheState(cacheState);
      });

    } catch (err) {
      logger.error(err);
      return setTimeout(retry, 1000);
    }
  };


  let watchEventUpdatesRetryTimeout;
  let watchEventUpdatesRetryPending = false;

  /**
   * @returns {number}
   */
  const watchEventUpdates = () => {
    let events;

    const retry = async () => {
      if (watchEventUpdatesRetryPending) {return;}
      watchEventUpdatesRetryPending = true;

      clearTimeout(watchEventUpdatesRetryTimeout);

      try {
        if (events && events.requestManager) {
          await callAsync(events.stopWatching.bind(events));
        }

      } catch (err) {
        logger.error(err);
      }

      watchEventUpdatesRetryTimeout = setTimeout(() => {
        watchEventUpdatesRetryPending = false;
        watchEventUpdates();
      }, 1000);
    };

    try {
      logger.info(`Watching for event updates`);

      events = eventBase.Updated({}, {fromBlock: cacheState.lastUpdateBlock, toBlock: 'latest'});

      events.watch(async (error, response) => {
        if (error) {
          logger.error(error, `Error while watching for events updates starting from block #${cacheState.lastUpdateBlock}`);
          return setTimeout(retry, 1000);
        }

        try {
          await indexingUtil.updateEvents([response]);
        } catch (err) {
          logger.error(err, `Error while indexing event update at block #${response.blockNumber}`);
          return setTimeout(retry, 1000);
        }

        cacheState.lastUpdateBlock = response.blockNumber - 1;
        writeCacheState(cacheState);
      });

    } catch (err) {
      logger.error(err);
      return setTimeout(retry, 1000);
    }
  };

  //watchEvents();
  watchEventUpdates();
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error, 'Emergency stop'); });
