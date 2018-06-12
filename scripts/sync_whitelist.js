import app_config from '../src/data/config.json';

import Web3 from 'web3';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import log4js from 'log4js';


import callAsync from '../src/util/web3Util';
import { getDeployAccount } from './util/getDeployAccountUtil';

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

  const config = Config.detect({'network': app_config.network});
  const resolver = new Resolver(config);
  const provider = config.provider;

  const Whitelist = resolver.require("../contracts/Whitelist.sol");

  const web3 = new Web3();
  web3.setProvider(provider);

  Whitelist.setProvider(provider);

  const coinbase = await callAsync(web3.eth.getCoinbase);

  Whitelist.defaults({from: coinbase});
  web3.eth.defaultAccount = coinbase;

  let whitelistInstance;
  let accounts, deployAccount;

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
    whitelistInstance = await Whitelist.deployed();
    deployAccount = getDeployAccount(accounts);
  } catch (error) {
    fatal(error);
  }

  const whitelist = app_config.whitelist;
  const blacklist = app_config.blacklist;

  for(let i = 0; i < blacklist.length; i++) {
    logger.info(`Syncing blacklist [${i}]: ${blacklist[i]}`);

    try {
      if ((await whitelistInstance.whitelist(blacklist[i])) !== false) {
        await whitelistInstance.updateWhitelist(blacklist[i], false, {from: deployAccount});
        logger.info(`Added new to blacklist [${i}]: ${whitelist[i]}`);
      }
    } catch (error) {
      fatal(error);
    }

    logger.info(`Done [${i}]: ${blacklist[i]}`);
  }

  for(let i = 0; i < whitelist.length; i++) {
    logger.info(`Syncing whitelist [${i}]: ${whitelist[i]}`);

    try {
      if ((await whitelistInstance.whitelist(whitelist[i])) !== true) {
        await whitelistInstance.updateWhitelist(whitelist[i], true, {from: deployAccount});
        logger.info(`Added new to whitelist [${i}]: ${whitelist[i]}`);
      }
    } catch (error) {
      fatal(error);
    }

    logger.info(`Done [${i}]: ${whitelist[i]}`);
  }

  logger.info('Done synchronization.');
  process.exit(0);
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
