import config from '../src/data/config.json';

import _ from 'lodash';
import fs from 'fs';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import faker from 'faker';
import log4js from 'log4js';

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
  const Event = resolver.require("../contracts/Event.sol");
  const Token = resolver.require("../contracts/Token.sol");

  const web3 = new Web3();
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

    // runTest(); // uncomment to create some events
    // getEvents();
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

    const eventData = `${bidType}.${category}.${locale}.${startDate}.${endDate}`;
    const tags = `${locale}.${faker.lorem.word()}.${locale}.${faker.lorem.word()}.${locale}.${faker.lorem.word()}`;
    const results = 'result_description_1.10.result_description_2.20';

    await main.newEvent(
      faker.lorem.sentence(),  // name
      faker.random.number({min: 10, max: 100}),  // deposit
      faker.lorem.sentence(),  // description
      1,  // operatorId
      eventData, // category // locale // startDate // endDate
      faker.internet.url(),  // sourceUrl
      tags, // tags
      results, // results
      {from: accounts[1]}
    );

    const eventAddress = await main.getLastEvent({from: accounts[1]});
    const event = Event.at(eventAddress);
    const name = await event.name({from: accounts[1]});
    const description = await event.description({from: accounts[1]});

    logger.info(`Created Event at address ${eventAddress} - { name: ${name}, description: ${description}, bidType: ${bidType} }`);
  }
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
