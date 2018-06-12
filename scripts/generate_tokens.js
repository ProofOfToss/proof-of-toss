import appConfig from '../src/data/config.json';

import Web3 from 'web3';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import log4js from 'log4js';
import callAsync from '../src/util/web3Util';
import { denormalizeBalance } from '../src/util/token';
import { getDeployAccount } from './util/getDeployAccountUtil';

const argv = require('yargs-parser')(process.argv.slice(2));
const address = '0x' + argv._[0].toString();
let tokens = 1000000;

if (argv._.length > 1) {
  tokens = argv._[1].toString();
}

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

  console.log(`Generating ${tokens} TOSS for ${address}`);

  console.log('Begin token.setUnpausedWallet');
  await token.setUnpausedWallet(address, true, {from: deployAccount});

  console.log('Begin token.mint');
  await token.mint(address, denormalizeBalance(tokens), {from: deployAccount});

  console.log(`Done`);
  process.exit(0);

})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
