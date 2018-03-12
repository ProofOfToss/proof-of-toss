import appConfig from '../src/data/config.json';
import appPrivateConfig from '../src/data/private_config.json';

import _ from 'lodash';
import fs from 'fs';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';

import log4js from 'log4js';

log4js.configure({
  appenders: {
    elasticsearch: { type: 'file', filename: 'elasticsearch.log' },
    out: { type: 'stdout' },
  },
  categories: { default: { appenders: ['elasticsearch', 'out'], level: 'debug' } }
});

const logger = log4js.getLogger('elasticsearch');

import AwsEsClient from '../src/util/esClient';

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const TAG_INDEX = 'toss_tag_' + appConfig.elasticsearch.indexPostfix;

const esClient = new AwsEsClient(
  { log: 'error' },
  appConfig.elasticsearch.esNode,
  appConfig.elasticsearch.region,
  appPrivateConfig.elasticsearch.accessKeyId,
  appPrivateConfig.elasticsearch.secretAccessKey,
  appConfig.elasticsearch.useSSL
);

(async (callback) => {
  const web3 = new Web3();

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

  const parseBytes = (byteString) => {
    let result = '', charCode;

    for (let i = 2; i < byteString.length; i += 2) {
      charCode = parseInt('0x' + byteString.substr(i, 2));

      if (charCode === 0) break;

      result += String.fromCharCode(charCode);
    }

    return result;
  };

  const convertBlockchainEventToEventDoc = async (_event) => {
    try {
      const event = Event.at(_event.eventAddress);
      const locale = parseBytes(await event.locale());
      const category = parseInt(parseBytes(await event.category()));
      const bidType = parseBytes(await event.bidType());
      const description = await event.description();

      const bidSum = (await Promise.all([
        event.possibleResults(0),
        event.possibleResults(1),
        event.possibleResults(2),
      ])).reduce((accumulator, result) => accumulator + parseInt(result[3]), 0);

      const startDate = await event.startDate();
      const endDate = await event.endDate();
      const sourceUrl = await event.sourceUrl();
      let tags = [];

      for (let i = 0; i < 10; i++) {
        const tag = (await event.tags(i))[0];

        if (!tag) { break; }

        tags.push({'locale': locale, 'name': tag});
      }

      return {
        'name': /*web3.toUtf8*/(_event.eventName),
        'description': /*web3.toUtf8*/(description),
        'bidType': bidType,
        'bidSum': bidSum,
        'address': _event.eventAddress,
        'createdBy': _event.eventCreator,
        'createdAt': _event.createdTimestamp.c,
        'locale': /*web3.toUtf8*/(locale),
        'category': /*web3.toUtf8*/(category),
        'startDate': startDate.c,
        'endDate': endDate.c,
        'sourceUrl': /*web3.toUtf8*/(sourceUrl),
        'tag': tags,
      };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  };

  const indexTags = async (tags) => {
    if (tags.length === 0) return;

    let body = [];

    for(let i = 0; i < tags.length; i++) {
      body.push({ index: { _index: TAG_INDEX, _type: 'tag', _id: new Buffer(`${tags[i].locale} ${tags[i].name}`).toString('base64') } });
      body.push({ name: tags[i].name, locale: tags[i].locale });
    }

    logger.trace(body);

    await esClient.bulk({body}).then((result) => {
      logger.info(result.items);
    }).catch((error) => {
      logger.error(error);
    });
  };

  const indexEvents = async (events) => {
    if (events.length === 0) return;

    let body = [];

    for(let i = 0; i < events.length; i++) {
      try {
        const doc = await convertBlockchainEventToEventDoc(events[i]);
        body.push({ index: { _index: EVENT_INDEX, _type: 'event', _id: doc.address } });
        body.push(doc);

        indexTags(doc.tag);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }

    logger.trace(body);

    await esClient.bulk({body}).then((result) => {
      logger.info(result.items);
    }).catch((error) => {
      logger.error(error);
    });
  };

  await esClient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
  }).then(() => {
    logger.info('elasticsearch cluster is up');
  }).catch((error) => {
    fatal(error, 'elasticsearch cluster is down! exiting');
  });

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
  const Event = resolver.require("../contracts/Event.sol");
  const Token = resolver.require("../contracts/Token.sol");

  web3.setProvider(provider);

  Token.setProvider(provider);
  Main.setProvider(provider);
  Event.setProvider(provider);
  Token.defaults({from: web3.eth.coinbase});
  Main.defaults({from: web3.eth.coinbase});
  Event.defaults({from: web3.eth.coinbase});

  web3.eth.defaultAccount = web3.eth.coinbase;

  let main, token, accounts;

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
  } catch (error) {
    fatal(error);
  }

  const cacheStateFile = './cache_state.json';

  function readCacheState(defaultState) {
    if (fs.existsSync(cacheStateFile)) {
      return JSON.parse(fs.readFileSync(cacheStateFile, {encoding: "utf8"}));
    } else {
      return defaultState;
    }
  }

  function writeCacheState(cacheState) {
    return fs.writeFileSync(cacheStateFile, JSON.stringify(cacheState) + '\n');
  }

  let cacheState = readCacheState({lastBlock: appConfig.firstBlock});

  logger.info(`Caching events starting from block #${cacheState.lastBlock} to block #${web3.eth.blockNumber}`);

  const step = 10;

  for(let i = cacheState.lastBlock; i < web3.eth.blockNumber; i += step) {
    logger.info(`Caching events from block #${i}`);

    const events = main.NewEvent({}, {fromBlock: cacheState.lastBlock, toBlock: cacheState.lastBlock + step});
    events.get(async (error, log) => {
      if (error) {
        fatal(error);
      }

      try {
        await indexEvents(_.map(log, 'args'));
      } catch (err) {
        fatal(err);
      }
    });

    cacheState.lastBlock = i;
    writeCacheState(cacheState);
  }

  logger.info(`Watching for new events`);

  let events = main.NewEvent({}, {fromBlock: cacheState.lastBlock, toBlock: 'latest'});
  const watchEvents = () => {
    const retry = () => {
      try {

        events.stopWatching();
        events = main.NewEvent({}, {fromBlock: cacheState.lastBlock, toBlock: 'latest'});
      } catch (err) {
        logger.error(err);
        return setTimeout(retry, 1000);
      }

      setTimeout(watchEvents, 1000);
    };

    try {

      events.watch(async (error, response) => {
        if (error) {
          logger.error(error, `Error while watching for new events starting from block #${cacheState.lastBlock}`);
          return retry();
        }

        try {
          await indexEvents([response.args]);
        } catch (err) {
          logger.error(err, `Error while indexing new event at block #${response.blockNumber}`);
          return retry();
        }

        cacheState.lastBlock = response.blockNumber - 1;
        writeCacheState(cacheState);
      });

    } catch (err) {
      logger.error(err);
      return setTimeout(retry, 1000);
    }
  };

  watchEvents();
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
