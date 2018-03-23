import config from '../src/data/config.json';

import _ from 'lodash';
import fs from 'fs';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import faker from 'faker';
import log4js from 'log4js';

import { serializeEvent, deserializeEvent } from '../src/util/eventUtil';

const logger = log4js.getLogger();
logger.level = 'debug';

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

  const config = Config.detect({'network': 'test'});
  const resolver = new Resolver(config);
  const provider = config.provider;

  const Main = resolver.require("../contracts/Main.sol");
  const EventBase = resolver.require("../contracts/EventBase.sol");
  const Token = resolver.require("../contracts/Token.sol");

  const web3 = new Web3();
  web3.setProvider(provider);

  Token.setProvider(provider);
  Main.setProvider(provider);
  EventBase.setProvider(provider);
  Token.defaults({from: web3.eth.coinbase});
  Main.defaults({from: web3.eth.coinbase});
  EventBase.defaults({from: web3.eth.coinbase});

  web3.eth.defaultAccount = web3.eth.coinbase;

  let main, token, accounts;

  await new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accs) => {
      if (err !== null) {
        reject(fatal(err, "There was an error fetching your accounts."));
      }

      if (accs.length === 0) {
        reject(fatal("Couldn't get any accounts! Make sure your Ethereum client is configured correctly."));
      }

      accounts = accs;

      resolve();
    });
  });

  try {
    main = await Main.deployed();
    token = await Token.deployed();
  } catch (error) {
    fatal(error);
  }

  // await token.grantToAllowBlocking(main.address, true, {from: accounts[0]});
  await token.generateTokens(accounts[1], 1000000000, {from: accounts[0]});

  await token.approve(main.address, 1500, {from: accounts[1]});
  await main.updateWhitelist(accounts[1], true);

  /*await main.newEvent('Test event', 100, 'en', 'category_id', 'description', 1,
    1517406195, 1580478195, 'source_url', {from: accounts[0]});*/

  for(let i = 0; i < 15; i++) {
    const category = faker.random.arrayElement([1, 2, 3]);
    const locale = faker.random.arrayElement(['en', 'ru', 'kz']);
    const startDate = parseInt(faker.date.future(0.1).getTime()/1000);
    const endDate = parseInt(faker.date.future(0.5).getTime()/1000);
    const bidType = faker.lorem.words();

    const tags = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];
    const results = [{description: 'result_description_1', coefficient: 10}, {description: 'result_description_2', coefficient: 20}];

    const deposit = faker.random.number({min: 10, max: 100});

    const bytes = serializeEvent({
      name: faker.lorem.sentence(),  // name
      description: faker.lorem.sentence(),  // description
      deposit: deposit,  // deposit
      bidType: bidType,
      category: category,
      locale: locale,
      startDate: startDate,
      endDate: endDate,
      sourceUrl: faker.internet.url(),  // sourceUrl
      tags: tags,
      results: results,
    });

    const transactionResult = await token.transferERC223(main.address, deposit, bytes, {
      from: accounts[0]
    });

    const events = await new Promise((resolve, reject) => {
      main.NewEvent({}, {fromBlock: transactionResult.receipt.blockNumber, toBlock: 'pending', topics: transactionResult.receipt.logs[0].topics}).get((error, log) => {
        if (error) {
          reject(error);
        }

        if (log[0].transactionHash === transactionResult.tx) {
          resolve(log);
        }
      });
    });

    const eventAddress = events[0].args.eventAddress;
    const eventData = deserializeEvent(events[0].args.eventData);
    // const event = EventBase.at(eventAddress);

    logger.info(`Created Event at address ${eventAddress} - { name: ${eventData.name}, description: ${eventData.description}, bidType: ${eventData.bidType} }`);
  }
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
