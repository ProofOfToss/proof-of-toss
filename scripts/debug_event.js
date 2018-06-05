// Usage:
// $ babel-node debug_event.js MAIN_ADDRESS EVENT_ADDRESS FROM_BLOCK TO_BLOCK
// * MAIN_ADDRESS: the address of Main contract which was used to create Event contract (without leading 0x)
// * EVENT_ADDRESS: the address of Event contract (without leading 0x)
// * FROM_BLOCK: a number of block to filter from
// * TO_BLOCK: a number of block to filter to
// Usage example:
// babel-node debug_event.js 460e426c63c19d267140e693472b6535cc5a826d 974b9a84483fe3830eead8b5cdc2227cd424f4cf 3329870 3329880

import appConfig from '../src/data/config.json';

import fs from 'fs';
import path from 'path';
import Web3 from 'web3';
import contract from 'truffle-contract';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import {IndexingUtil} from '../src/util/indexingUtil';
import { deserializeEvent } from '../src/util/eventUtil';
import callAsync from '../src/util/web3Util';
import tokenJson from '../build/contracts/Token.json';

(async () => {
  const web3 = new Web3();

  const config = Config.detect({'network': appConfig.network});
  const resolver = new Resolver(config);
  const provider = config.provider;

  const Main = resolver.require("../contracts/Main.sol");

  web3.setProvider(provider);
  Main.setProvider(provider);

  const coinbase = await callAsync(web3.eth.getCoinbase);
  
  Main.defaults({from: coinbase});

  web3.eth.defaultAccount = coinbase;

  let main, accounts;

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
    const argv = require('yargs-parser')(process.argv.slice(2));

    const mainAddress = '0x' + argv._[0].toString();
    const eventAddress = '0x' + argv._[1].toString();
    const fromBlock = parseInt(argv._[2], 10);
    const toBlock = parseInt(argv._[3], 10);

    main = Main.at(mainAddress);

    main.NewEvent({'eventAddress': eventAddress}, {fromBlock: fromBlock, toBlock: toBlock}, function (e, r) {
      if (e) {
        console.log(e);
      } else {
        console.log(deserializeEvent(r.args.eventData));
      }

      process.exit();
    });
  } catch (error) {
    console.log(error);
  }
})();
