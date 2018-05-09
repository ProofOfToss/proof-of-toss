import appConfig from '../src/data/config.json';

import Web3 from 'web3';
import Config from 'truffle-config';
import log4js from 'log4js';

const logger = log4js.getLogger();
logger.level = 'debug';

(async (callback) => {

  const config = Config.detect({'network': 'test'});
  const provider = config.provider;

  const web3 = new Web3();
  web3.setProvider(provider);

  web3.currentProvider.sendAsync({jsonrpc: "2.0", method: "evm_mine", id: 12345 }, console.log);

  console.log(`Blockchain time: ${new Date(1000 * parseInt(web3.eth.getBlock(web3.eth.blockNumber).timestamp))}`);

})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
