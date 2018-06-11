import appConfig from '../src/data/config.json';

import Web3 from 'web3';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import log4js from 'log4js';
import callAsync from '../src/util/web3Util';
import { denormalizeBalance } from '../src/util/token';
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

  const config = Config.detect({'network': appConfig.network});
  const resolver = new Resolver(config);
  const provider = config.provider;

  const Token = resolver.require("../contracts/Token.sol");
  const Main = resolver.require("../contracts/Main.sol");

  const web3 = new Web3();
  web3.setProvider(provider);

  const coinbase = await callAsync(web3.eth.getCoinbase);

  Token.setProvider(provider);
  Token.defaults({from: coinbase});

  Main.setProvider(provider);
  Main.defaults({from: coinbase});

  web3.eth.defaultAccount = coinbase;

  let token, main, accounts;
  let deployAccount;

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
    token = await Token.deployed();
    main = await Main.deployed();
    deployAccount = getDeployAccount(accounts);
  } catch (error) {
    fatal(error);
  }

  // await token.setPause(false, {from: accounts[0]});

  logger.info('Begin token.setPause');
  await token.setPause(true, {from: deployAccount});

  logger.info('Begin token.setUnpausedWallet');
  await token.setUnpausedWallet(main.address, true, {from: deployAccount});

  logger.info('Begin token.grantToSetUnpausedWallet');
  await token.grantToSetUnpausedWallet(main.address, true, {from: deployAccount});

  logger.info('Begin token.mint');
  await token.mint(deployAccount, denormalizeBalance(100000), {from: deployAccount});

  logger.info('Done preparing demo token.');
  process.exit(0);
})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
