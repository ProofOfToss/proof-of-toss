import appConfig from '../src/data/config.json';

import fs from 'fs';
import path from 'path';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import {IndexingUtil} from '../src/util/indexingUtil';
import callAsync from '../src/util/web3Util';
import {getBuiltContract} from '../src/util/buildDir';

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

  logger.info('Trying to resolve cache_state.json');

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
    logger.info('cache state saved: ', cacheState);
    return fs.writeFileSync(cacheStateFile, JSON.stringify(cacheState) + '\n');
  }

  logger.info(`Network id: ${Token.network_id}`);
  logger.info(`Trying to find first block.`);

  const tokenTransactionHash = tokenJson.networks[Token.network_id].transactionHash;

  logger.info(`Token.transactionHash: ${tokenTransactionHash}.`);

  const firstBlock = (await callAsync(web3.eth.getTransactionReceipt.bind(web3.eth, tokenTransactionHash))).blockNumber;

  logger.info(`First block: #${firstBlock}`);

  let cacheState = readCacheState({lastBlock: firstBlock, lastUpdateBlock: firstBlock});
  const blockNumber = await callAsync(web3.eth.getBlockNumber);

  logger.info(`Caching events starting from block #${cacheState.lastBlock} to block #${blockNumber}`);

  const step = 1000;

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

  for(let i = cacheState.lastUpdateBlock; i < blockNumber; i += step) {
    logger.info(`Caching event updates from block #${i}`);

    const update_events = eventBase.Updated({}, {fromBlock: cacheState.lastUpdateBlock, toBlock: cacheState.lastUpdateBlock + step});

    try {
      const log = await callAsync(update_events.get.bind(update_events));

      try {
        await indexingUtil.updateEvents(log);
        cacheState.lastUpdateBlock = i;
        writeCacheState(cacheState);
      } catch (err) {
        fatal(err, `Error while caching event updates from block #${i}`);
      }
    } catch (error) {
      fatal(error, `Error while fetching event updates from block #${i}`);
    }
  }

  logger.info(`Events to block #${blockNumber} cached`);


  let eventsWatchObject;
  let watchEventRetryTimeoutId;
  let watchEventRetryPending = false;

  const tryWatchEvents = async () => {
    if (watchEventRetryPending) {
      return;
    }

    watchEventRetryPending = true;

    clearTimeout(watchEventRetryTimeoutId);

    try {
      if (eventsWatchObject && eventsWatchObject.requestManager) {
        logger.info('Stopping watching new events.');

        await callAsync(eventsWatchObject.stopWatching.bind(eventsWatchObject));
      }
    } catch (err) {
      logger.error(err);
    }

    watchEventRetryTimeoutId = setTimeout(() => {
      watchEventRetryPending = false;
      watchEvents();
    }, 1000);
  };

  /**
   * @returns {number}
   */
  const watchEvents = () => {
    try {
      logger.info(`Watching for new events from block #${cacheState.lastBlock + 1} to latest block`);

      eventsWatchObject = main.NewEvent({}, {fromBlock: cacheState.lastBlock + 1, toBlock: 'latest'});
      eventsWatchObject.watch(async (error, response) => {
        if (error) {
          logger.error(error, `Error while watching for new events starting from block #${cacheState.lastBlock + 1}`);

          return setTimeout(tryWatchEvents, 1000);
        }

        try {
          await indexingUtil.indexEvents([response]);
        } catch (err) {
          logger.error(err, `Error while indexing new event at block #${response.blockNumber}`);

          return setTimeout(tryWatchEvents, 1000);
        }

        cacheState.lastBlock = response.blockNumber;
        writeCacheState(cacheState);
      });

    } catch (err) {
      logger.error(err);

      return setTimeout(tryWatchEvents, 1000);
    }
  };

  let eventUpdatesWatchObject;
  let watchEventUpdatesRetryTimeoutId;
  let watchEventUpdatesRetryPending = false;

  const tryWatchEventUpdates = async () => {
    if (watchEventUpdatesRetryPending) {
      return;
    }

    watchEventUpdatesRetryPending = true;

    clearTimeout(watchEventUpdatesRetryTimeoutId);

    try {
      if (eventUpdatesWatchObject && eventUpdatesWatchObject.requestManager) {
        logger.info('Stopping watching event updates.');

        await callAsync(eventUpdatesWatchObject.stopWatching.bind(eventUpdatesWatchObject));
      }
    } catch (err) {
      logger.error(err);
    }

    watchEventUpdatesRetryTimeoutId = setTimeout(() => {
      watchEventUpdatesRetryPending = false;
      watchEventUpdates();
    }, 1000);
  };

  /**
   * @returns {number}
   */
  const watchEventUpdates = () => {
    try {
      logger.info(`Watching for event updates from block #${cacheState.lastUpdateBlock + 1} to latest block`);

      eventUpdatesWatchObject = eventBase.Updated({}, {fromBlock: cacheState.lastUpdateBlock + 1, toBlock: 'latest'});
      eventUpdatesWatchObject.watch(async (error, response) => {
        if (error) {
          logger.error(error, `Error while watching for events updates starting from block #${cacheState.lastUpdateBlock + 1}`);

          return setTimeout(tryWatchEventUpdates, 1000);
        }

        try {
          await indexingUtil.updateEvents([response]);
        } catch (err) {
          logger.error(err, `Error while indexing event update at block #${response.blockNumber}`);

          return setTimeout(tryWatchEventUpdates, 1000);
        }

        cacheState.lastUpdateBlock = response.blockNumber;
        writeCacheState(cacheState);
      });

    } catch (err) {
      logger.error(err);

      return setTimeout(tryWatchEventUpdates, 1000);
    }
  };

  try {
    tryWatchEvents();
    tryWatchEventUpdates();

    setInterval(() => {
      logger.info('Auto retry retryWatchEvents() and retryWatchEventUpdates() after 1 minute.');

      tryWatchEvents();
      tryWatchEventUpdates();
    }, 1000 * 20);
  } catch (err) {
    fatal(err);
  }
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error, 'Emergency stop'); });
