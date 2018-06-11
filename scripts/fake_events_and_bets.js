import appConfig from '../src/data/config.json';

import _ from 'lodash';
import fs from 'fs';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import faker from 'faker';
import log4js from 'log4js';
import callAsync from '../src/util/web3Util';

import { serializeEvent, deserializeEvent } from '../src/util/eventUtil';
import { decodeEvent } from '../src/util/web3Util';
import {toBytesTruffle as toBytes} from '../src/util/serialityUtil';
import { denormalizeBalance } from '../src/util/token'

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

  console.log('Starting');

  const config = Config.detect({'network': appConfig.network});
  const resolver = new Resolver(config);
  const provider = config.provider;

  const Main = resolver.require("../contracts/Main.sol");
  const EventBase = resolver.require("../contracts/EventBase.sol");
  const Token = resolver.require("../contracts/Token.sol");
  const Whitelist = resolver.require("../contracts/Whitelist.sol");

  const web3 = new Web3();
  web3.setProvider(provider);

  Token.setProvider(provider);
  Main.setProvider(provider);
  EventBase.setProvider(provider);
  Whitelist.setProvider(provider);

  console.log('Getting coinbase');

  const coinbase = await callAsync(web3.eth.getCoinbase);
  
  Token.defaults({from: coinbase});
  Main.defaults({from: coinbase});
  EventBase.defaults({from: coinbase});
  Whitelist.defaults({from: coinbase});

  web3.eth.defaultAccount = coinbase;

  let main, token, accounts, whitelist;

  console.log('Getting accounts');

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
    whitelist = await Whitelist.deployed();
  } catch (error) {
    fatal(error);
  }

  // await token.grantToAllowBlocking(main.address, true, {from: accounts[0]});
  // await token.generateTokens(accounts[1], 1000000000, {from: accounts[0]});

  // await token.approve(main.address, 1500, {from: accounts[1]});
  // await whitelist.updateWhitelist(accounts[1], true);

  /*await main.newEvent('Test event', 100, 'en', 'category_id', 'description', 1,
    1517406195, 1580478195, 'source_url', {from: accounts[0]});*/

  console.log('Accounts: ', accounts);

  await token.setPause(false, {from: accounts[0]});

  console.log('Mining tokens 1');
  await token.mint(accounts[0], denormalizeBalance(100), {from: accounts[0]});
  console.log('Mining tokens 2');
  await token.mint(accounts[1], denormalizeBalance(200), {from: accounts[0]});
  console.log('Mining tokens 3');
  await token.mint(accounts[2], denormalizeBalance(300), {from: accounts[0]});

  for(let i = 0; i < 9; i++) {
    console.log('Generating event ' + i);

    const category = faker.random.arrayElement([1, 2, 3]);
    const locale = faker.random.arrayElement(['en'/*, 'ru', 'kz'*/]);
    const startDate = Math.floor((new Date()).getTime() / 1000) + 1260; // parseInt(faker.date.future(0.1).getTime()/1000);
    const endDate = startDate + 10;
    const bidType = faker.lorem.words();

    const tags = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];
    const results = [{description: 'result_description_1', coefficient: 1}, {description: 'result_description_2', coefficient: 2}, {description: 'result_description_3', coefficient: 3}];

    const deposit = denormalizeBalance(faker.random.number({min: 10, max: 100}));

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

    console.log(bytes);

    const transactionResult = await token.transferToContract(main.address, deposit, bytes, {
      from: accounts[0],
      gasPrice: 100000000000
    });

    console.log(accounts[0]);
    console.log(transactionResult.tx);
    console.log(transactionResult.receipt.logs);
    //process.exit();

    const events = [{
      args: decodeEvent(web3, transactionResult.receipt.logs, Main, 'NewEvent'),
    }];

    console.log(events[0]);

    const eventAddress = events[0].args.eventAddress;
    const eventData = deserializeEvent(events[0].args.eventData);
    // const event = EventBase.at(eventAddress);

    logger.info(`Created Event at address ${eventAddress} - { name: ${eventData.name}, description: ${eventData.description}, bidType: ${eventData.bidType} }`);


    // Bet 1
    await token.transferToContract(
      eventAddress,
      denormalizeBalance(10),
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    );

    // Bet 2
    await token.transferToContract(
      eventAddress,
      denormalizeBalance(20),
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 1}, // result index
      ),
      {from: accounts[1]}
    );

    // Bet 3
    await token.transferToContract(
      eventAddress,
      denormalizeBalance(30),
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 2}, // result index
      ),
      {from: accounts[2]}
    );
  }
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
