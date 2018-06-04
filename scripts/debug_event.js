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
