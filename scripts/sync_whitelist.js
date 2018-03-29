import app_config from '../src/data/config.json';

import Web3 from 'web3';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import log4js from 'log4js';

import callAsync from '../src/util/web3Util';

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

  try {
    whitelistInstance = await Whitelist.deployed();
  } catch (error) {
    fatal(error);
  }

  const whitelist = app_config.whitelist;
  const blacklist = app_config.blacklist;

  for(let i = 0; i < blacklist.length; i++) {
    logger.info(`Syncing blacklist [${i}]: ${blacklist[i]}`);

    try {
      await whitelistInstance.updateWhitelist(blacklist[i], false);
    } catch (error) {
      fatal(error);
    }

  }

  for(let i = 0; i < whitelist.length; i++) {
    logger.info(`Syncing whitelist [${i}]: ${whitelist[i]}`);

    try {
      await whitelistInstance.updateWhitelist(whitelist[i], true);
    } catch (error) {
      fatal(error);
    }

  }
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
