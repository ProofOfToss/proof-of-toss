import fs from 'fs';
import contract from 'truffle-contract';
import callAsync from '../src/util/web3Util';
import _ from 'lodash';

export default class EventWatcher {
  /**
   * @param {string}  EVENT_INDEX
   * @param {string}  TAG_INDEX
   * @param {string}  BET_INDEX
   * @param {object}  esClient
   * @param {object}  logger
   * @param {object}  web3
   * @param {object}  truffleConfig
   * @param {object}  contractAPIs
   * @param {object}  EventBaseConfig
   * @param {string}  cacheStateFile
   * @param {int}     firstBlock
   * @param {boolean} exitOnFatal
   */
  constructor(EVENT_INDEX, TAG_INDEX, BET_INDEX, esClient, logger, web3, truffleConfig, contractAPIs, EventBaseConfig, cacheStateFile, firstBlock, exitOnFatal = true) {
    this.EVENT_INDEX = EVENT_INDEX;
    this.TAG_INDEX = TAG_INDEX;
    this.BET_INDEX = BET_INDEX;

    this.esClient = esClient;
    this.logger = logger;
    this.web3 = web3;
    this.truffleConfig = truffleConfig;

    this.contractAPIs = contractAPIs;
    this.EventBaseConfig = EventBaseConfig;
    this.cacheStateFile = cacheStateFile;
    this.firstBlock = firstBlock;

    this.cacheState = this.readCacheState({lastBlock: firstBlock, lastUpdateBlock: firstBlock});

    this.cacheEvents = this.cacheEvents.bind(this);
    this.cacheEventUpdates = this.cacheEventUpdates.bind(this);
    this.tryWatchEvents = this.tryWatchEvents.bind(this);
    this.watchEvents = this.watchEvents.bind(this);
    this.tryWatchEventUpdates = this.tryWatchEventUpdates.bind(this);
    this.watchEventUpdates = this.watchEventUpdates.bind(this);

    /**
     * Emergency stop
     */
    this.fatal = function() {
      let _fatal = logger.fatal.bind(logger);

      for (let key in arguments) {
        if (arguments.hasOwnProperty(key)) {
          _fatal = _fatal.bind(logger, arguments[key]);
        }
      }

      _fatal();

      if (exitOnFatal) {
        process.exit(1);
      } else {
        throw new Error('Emergency stop');
      }
    };
    
    this.initPromise = this.init();
  }
  
  async init() {
    let eventBases = {};

    for(let address in this.EventBaseConfig) {
      if (!this.EventBaseConfig.hasOwnProperty(address)) { continue; }

      eventBases[address] = Object.assign({address}, this.EventBaseConfig[address]);

      if (typeof this.EventBaseConfig[address].artifacts === 'string') {
        eventBases[address].artifacts = require(`../build_archive/contracts/${this.EventBaseConfig[address].artifacts}`);
      }

      eventBases[address].serializer = require(`../src/util/event/${this.EventBaseConfig[address].serializer}`);

      const EventBaseContract = contract(eventBases[address].artifacts);
      EventBaseContract.setProvider(this.truffleConfig.provider);
      EventBaseContract.setNetwork(this.truffleConfig.network_id);
      EventBaseContract.defaults({from: this.truffleConfig.from, gas: this.truffleConfig.gas, gasPrice: this.truffleConfig.gasPrice});

      eventBases[address].contractClass = EventBaseContract;
      eventBases[address].contract = await EventBaseContract.at(EventBaseContract.address);

      const EventIndexer = require(`./util/event/${this.EventBaseConfig[address].indexer}`).default;
      eventBases[address].indexer = new EventIndexer(
        this.EVENT_INDEX,
        this.TAG_INDEX,
        this.BET_INDEX,
        this.esClient,
        this.logger,
        this.web3,
        {
          Token: this.contractAPIs.Token,
          Main: this.contractAPIs.Main,
          EventBase: eventBases[address].contractClass,
        }
      );

      const contractTransactionHash = eventBases[address].artifacts.networks[this.truffleConfig.network_id].transactionHash;
      eventBases[address].fromBlock = (await callAsync(this.web3.eth.getTransactionReceipt.bind(this.web3.eth, contractTransactionHash))).blockNumber;
    }

    eventBases = _.sortBy(eventBases, 'fromBlock');

    const eventBaseKeys = Object.keys(eventBases);
    eventBaseKeys.forEach((key, idx) => {
      if (idx === 0) { return; }

      eventBases[eventBaseKeys[idx - 1]].toBlock = eventBases[key].fromBlock;
    });

    this.eventBases = _.keyBy(eventBases, 'address');

    try {
      this.main = await this.contractAPIs.Main.deployed();
    } catch (error) {
      this.fatal(error);
    }
  }

  /**
   * @param defaultState
   * @returns {*}
   */
  readCacheState(defaultState) {
    if (fs.existsSync(this.cacheStateFile)) {
      try {
        const state = JSON.parse(fs.readFileSync(this.cacheStateFile, {encoding: "utf8"}));
        return Object.assign({}, defaultState, state);
      } catch (e) {
        this.logger.error(e);
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
  writeCacheState(cacheState) {
    this.logger.info('cache state saved: ', cacheState);
    return fs.writeFileSync(this.cacheStateFile, JSON.stringify(cacheState) + '\n');
  }

  async cacheEvents() {
    const blockNumber = await callAsync(this.web3.eth.getBlockNumber);

    this.logger.info(`Caching events starting from block #${this.cacheState.lastBlock} to block #${blockNumber}`);

    const step = 1000;

    for (let address in this.eventBases) {
      if (!this.eventBases.hasOwnProperty(address)) { continue; }

      const toBlock = this.eventBases[address].toBlock ? this.eventBases[address].toBlock : blockNumber;

      for (let i = this.cacheState.lastBlock; i < toBlock; i += step) {
        this.logger.info(`Caching events from block #${i}`);

        const events = this.main.NewEvent({}, {
          fromBlock: this.cacheState.lastBlock,
          toBlock: this.cacheState.lastBlock + step
        });

        try {
          const log = await callAsync(events.get.bind(events));

          try {
            await this.eventBases[address].indexer.indexEvents(log);
            this.cacheState.lastBlock = i;
            this.writeCacheState(this.cacheState);
          } catch (err) {
            this.fatal(err, `Error while caching events from block #${i}`);
          }
        } catch (error) {
          this.fatal(error, `Error while fetching events from block #${i}`);
        }
      }

      if (this.cacheState.lastBlock > toBlock) {
        this.cacheState.lastBlock = toBlock;
      }
    }

    this.logger.info(`Events to block #${blockNumber} cached`);
  }

  async cacheEventUpdates() {
    const blockNumber = await callAsync(this.web3.eth.getBlockNumber);
    const step = 1000;

    for (let i = this.cacheState.lastUpdateBlock; i < blockNumber; i += step) {
      this.logger.info(`Caching event updates from block #${i}`);

      for (let address in this.eventBases) {
        if (!this.eventBases.hasOwnProperty(address)) { continue; }

        const update_events = this.eventBases[address].contract.Updated({}, {
          fromBlock: this.cacheState.lastUpdateBlock,
          toBlock: this.cacheState.lastUpdateBlock + step
        });

        try {
          const log = await callAsync(update_events.get.bind(update_events));

          try {
            await this.eventBases[address].indexer.updateEvents(log);
            this.cacheState.lastUpdateBlock = i;
            this.writeCacheState(this.cacheState);
          } catch (err) {
            this.fatal(err, `Error while caching event updates from block #${i}`);
          }
        } catch (error) {
          this.fatal(error, `Error while fetching event updates from block #${i}`);
        }
      }
    }

    this.logger.info(`Event updates to block #${blockNumber} cached`);
  }


  eventsWatchObject;
  watchEventRetryTimeoutId;
  watchEventRetryPending = false;

  async tryWatchEvents() {
    if (this.watchEventRetryPending) {
      return;
    }

    this.watchEventRetryPending = true;

    clearTimeout(this.watchEventRetryTimeoutId);

    try {
      if (this.eventsWatchObject && this.eventsWatchObject.requestManager) {
        this.logger.info('Stopping watching new events.');

        await callAsync(this.eventsWatchObject.stopWatching.bind(this.eventsWatchObject));
      }
    } catch (err) {
      this.logger.error(err);
    }

    this.watchEventRetryTimeoutId = setTimeout(() => {
      this.watchEventRetryPending = false;
      this.watchEvents();
    }, 1000);
  }

  /**
   * @returns {number}
   */
  watchEvents() {
    try {
      this.logger.info(`Watching for new events from block #${this.cacheState.lastBlock + 1} to latest block`);

      const indexer = this.eventBases[this.contractAPIs.EventBase.address].indexer;

      this.eventsWatchObject = this.main.NewEvent({}, {fromBlock: this.cacheState.lastBlock + 1, toBlock: 'latest'});
      this.eventsWatchObject.watch(async (error, response) => {
        if (error) {
          this.logger.error(error, `Error while watching for new events starting from block #${this.cacheState.lastBlock + 1}`);

          return setTimeout(this.tryWatchEvents, 1000);
        }

        try {
          await indexer.indexEvents([response]);
        } catch (err) {
          this.logger.error(err, `Error while indexing new event at block #${response.blockNumber}`);

          return setTimeout(this.tryWatchEvents, 1000);
        }

        this.cacheState.lastBlock = response.blockNumber;
        this.writeCacheState(this.cacheState);
      });

    } catch (err) {
      this.logger.error(err);

      return setTimeout(this.tryWatchEvents, 1000);
    }
  }

  eventUpdatesWatchObject;
  watchEventUpdatesRetryTimeoutId;
  watchEventUpdatesRetryPending = false;

  async tryWatchEventUpdates() {
    if (this.watchEventUpdatesRetryPending) {
      return;
    }

    this.watchEventUpdatesRetryPending = true;

    clearTimeout(this.watchEventUpdatesRetryTimeoutId);

    try {
      if (this.eventUpdatesWatchObject && this.eventUpdatesWatchObject.requestManager) {
        this.logger.info('Stopping watching event updates.');

        await callAsync(this.eventUpdatesWatchObject.stopWatching.bind(this.eventUpdatesWatchObject));
      }
    } catch (err) {
      this.logger.error(err);
    }

    this.watchEventUpdatesRetryTimeoutId = setTimeout(() => {
      this.watchEventUpdatesRetryPending = false;
      this.watchEventUpdates();
    }, 1000);
  }

  /**
   * @returns {number}
   */
  watchEventUpdates() {
    try {
      this.logger.info(`Watching for event updates from block #${this.cacheState.lastUpdateBlock + 1} to latest block`);

      for(let address in this.eventBases) {
        if (!this.eventBases.hasOwnProperty(address)) { continue; }
        if (this.eventBases[address].expired) { continue; }

        this.eventUpdatesWatchObject = this.eventBases[address].contract.Updated({}, {fromBlock: this.cacheState.lastUpdateBlock + 1, toBlock: 'latest'});
        this.eventUpdatesWatchObject.watch(async (error, response) => {
          if (error) {
            this.logger.error(error, `Error while watching for events updates starting from block #${this.cacheState.lastUpdateBlock + 1}`);

            return setTimeout(this.tryWatchEventUpdates, 1000);
          }

          try {
            await this.eventBases[address].indexer.updateEvents([response]);
          } catch (err) {
            this.logger.error(err, `Error while indexing event update at block #${response.blockNumber}`);

            return setTimeout(this.tryWatchEventUpdates, 1000);
          }

          this.cacheState.lastUpdateBlock = response.blockNumber;
          this.writeCacheState(this.cacheState);
        });
      }

    } catch (err) {
      this.logger.error(err);

      return setTimeout(this.tryWatchEventUpdates, 1000);
    }
  }
}
