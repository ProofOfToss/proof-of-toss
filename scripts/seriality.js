import appConfig from '../src/data/config.json';

import _ from 'lodash';
import Web3 from 'web3';
import Config from 'truffle-config';
import Resolver from 'truffle-resolver';
import {toBytesTruffle as toBytes, toBytesWeb, fromBytes, toBytesBuffer, bytesToByteStringsArray} from '../src/util/serialityUtil';

import compressjs from 'compressjs';

import log4js from 'log4js';

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
  },
  categories: { default: { appenders: ['out'], level: 'debug' } }
});

const logger = log4js.getLogger('out');

(async (callback) => {
  const web3 = new Web3();

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

  const SerialityTest = resolver.require("../contracts/test/SerialityTest.sol");
  const TestEventBase = resolver.require("../contracts/test/TestEventBase.sol");
  const Token = resolver.require("../contracts/Token.sol");

  web3.setProvider(provider);

  SerialityTest.setProvider(provider);
  Token.setProvider(provider);
  TestEventBase.setProvider(provider);
  SerialityTest.defaults({from: web3.eth.coinbase});
  Token.defaults({from: web3.eth.coinbase});
  TestEventBase.defaults({from: web3.eth.coinbase});

  web3.eth.defaultAccount = web3.eth.coinbase;

  let serialityTest, token, accounts;

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
    serialityTest = await SerialityTest.deployed();
    token = await Token.deployed();
  } catch (error) {
    fatal(error);
  }

  let arr, result, n;

  /*// Sample 3

  arr = toBytes(
    {type: 'address', value: "0x1cb5cf010e407afc6249627bfd769d82d8dbbf71"}
  );

  result = await serialityTest.testSample3(arr, {from: accounts[0]});

  logger.info(`Sample 3 Bytes:`, arr.length, arr);

  n = result.logs[0].args;

  // logger.info(`Logs:`, result.logs);
  logger.info(`Sample 3 Result:`, {
    n1: n.n1,
    buffer: n.buffer,
  });

  // Sample 2

  arr = toBytes(
    {type: 'int', size: 8, value: -12},
    {type: 'int', size: 24, value: 838860},
    {type: 'uint', size: 32, value: 85},
    {type: 'int', size: 128, value: -44444444444},
    {type: 'address', value: "0x15b7926835a7c2fd6d297e3adecc5b45f7309f59"},
    {type: 'address', value: "0x1cb5cf010e407afc6249627bfd769d82d8dbbf71"}
  );

  // 128 chars: 1cb5cf010e407afc6249627bfd769d82d8dbbf7115b7926835a7c2fd6d297e3adecc5b45f7309f59fffffffffffffffffffffff5a6e798e413de43550cccccf4
  logger.info(`Sample 2 Bytes:`, arr.length, arr);

  result  = await serialityTest.testSample2(arr, {from: accounts[0]});

  n = result.logs[0].args;

  // logger.info(`Logs:`, result.logs);
  logger.info(`Sample 2 Result:`, {
    n1: n.n1.toNumber(),
    n2: n.n2.toNumber(),
    n3: n.n3.toNumber(),
    n4: n.n4.toNumber(),
    n5: n.n5,
    n6: n.n6,
  });

  // Sample 1

  arr = toBytes(
    {type: 'int', size: 8, value: 87},
    {type: 'uint', size: 24, value: 76545},
    {type: 'string', value: 'Bia inja dahan service'},
    {type: 'string', value: 'Copy kon lashi'},
    {type: 'int', size: 256, value: 34444445},
    200
  );

  //            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020d949d436f7079206b6f6e206c61736869000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e42696120696e6a6120646168616e2073657276696365000000000000000000000000000000000000000000000000000000000000000000000000000000000016012b0157
  // 400 chars: 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020d949d436f7079206b6f6e206c61736869000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e42696120696e6a6120646168616e2073657276696365000000000000000000000000000000000000000000000000000000000000000000000000000000000016012b0157
  logger.info(`Sample 1 Bytes:`, arr.length, arr);

  result = await serialityTest.testSample1(arr, {from: accounts[0], gas: 6721975});

  logger.info(result);

  n = result.logs[0].args;

  // logger.info(`Logs:`, result.logs);
  logger.info(`Sample 1 Result:`, {
    n1: n.n1.toNumber(),
    n2: n.n2.toNumber(),
    n3: n.n3.toNumber(),
    n4: n.n4,
    n5: n.n5,
  });*/

  // Event


  // Mapping:
  // ... | string tagName_2 | string tagName_1
  // ... | string result_3Description | string result_2Description | string result_1Description
  // string sourceUrl
  // string description
  // string name
  // bytes32 bidType
  // bytes2 locale
  // ... | uint64 result_3Coefficient | uint64 result_2Coefficient | uint64 result_1Coefficient
  // uint8 tagsCount | uint8 resultsCount | uint64 endDate | uint64 startDate | uint64 deposit

  const now = Math.floor((new Date()).getTime() / 1000);

  let eventInfo = toBytesBuffer(
    {type: 'string', size: 2, value: 'en'}, // locale
    {type: 'string', size: 32, value: 'bid_type'}, // bidType
    {type: 'string', value: 'Test event name Test event name'}, // name
    {type: 'string', value: 'Test event description. Test event description. Test event description. Test event description.'}, // description
    {type: 'string', value: 'https://google.com/'}, // sourceUrl

    {type: 'string', value: 'Result 1 description Result 1 description'}, // result_1Description
    {type: 'string', value: 'Result 2 description Result 2 description'}, // result_2Description
    {type: 'string', value: 'Result 3 description Result 3 description'}, // result_3Description

    {type: 'string', value: 'Tag 1 name'}, // tagName_1
    {type: 'string', value: 'Tag 2 name'}, // tagName_2
  );

  logger.info(`Event Info Bytes:`, eventInfo.length, bytesToByteStringsArray(eventInfo).join(''));

  const algorithm = compressjs.BWTC;
  const data = new Buffer(eventInfo, 'utf8');
  const compressed = algorithm.compressFile(data);

  logger.info(`Event Compressed Info Bytes:`, compressed.length, bytesToByteStringsArray(compressed).join(''));

  let deposit = 10;

  arr = toBytes(
    {type: 'uint', size: 64, value: deposit}, // deposit
    {type: 'uint', size: 64, value: now + 7 * 24 * 3600}, // startDate
    {type: 'uint', size: 64, value: now + 7 * 24 * 3600 + 3600}, // endDate
    {type: 'uint', size: 8, value: 3}, // resultsCount
    {type: 'uint', size: 8, value: 2}, // tagsCount

    {type: 'uint', size: 64, value: 1}, // result_1Coefficient
    {type: 'uint', size: 64, value: 2}, // result_2Coefficient
    {type: 'uint', size: 64, value: 3}, // result_3Coefficient

    {type: 'bytes', value: compressed},
  );

  logger.info(`Event Bytes:`, arr.length / 2, arr);
  // logger.info(`Event Bytes Web:`, arr.length / 2, JSON.stringify(toBytesWeb({type: 'bytes', value: arr})));

  // result = await serialityTest.testSampleEvent(accounts[0], arr, {from: accounts[0], gas: 6721975});
  // n = result.logs[0];
  result = await token.transfer(serialityTest.address, deposit, arr, {from: accounts[0], gas: 6721975});

  const events = await new Promise((resolve, reject) => {
    serialityTest.NewEvent({}, {fromBlock: result.receipt.blockNumber, toBlock: result.receipt.blockNumber, topics: result.receipt.logs[0].topics}).get((error, log) => {
      if (error) {
        reject(error);
      }

      resolve(log);
    });
  });

  n = events[0].args;

  logger.info(result);

  // logger.info(`Logs:`, result.receipt.logs);
  logger.info(`Event Result:`, n);

  let parsed = fromBytes(
    n.eventData,
    {type: 'uint', size: 64, key: 'deposit'},
    {type: 'uint', size: 64, key: 'startDate'},
    {type: 'uint', size: 64, key: 'endDate'},
    {type: 'uint', size: 8, key: 'resultsCount'},
    {type: 'uint', size: 8, key: 'tagsCount'},
  );
  let offset = parsed.offset, parsedData = parsed.parsedData;

  let fromBytesArgs = [n.eventData, offset];

  logger.info(`Event Result [resultsCount]:`, parsedData.resultsCount);

  for(let i = 0; i < parsedData.resultsCount; i++) {
    fromBytesArgs.push({type: 'uint', size: 64, key: `result_${i + 1}Coefficient`});
  }

  parsed = fromBytes.apply(this, fromBytesArgs);
  offset = parsed.offset;
  Object.assign(parsedData, parsed.parsedData);

  logger.info(`Event Result [parsedData]:`, parsed.parsedData);

  let compressedData = n.eventData.substr(0, offset);
  let compressedBuffer = toBytesBuffer({type: 'bytes', value: compressedData});
  const decompressed = algorithm.decompressFile(compressedBuffer);

  logger.info(`Event Compressed Info Bytes:`, compressedData.length / 2, compressedData);
  logger.info(`Event Decompressed Info Bytes:`, decompressed.length, bytesToByteStringsArray(decompressed).join(''));

  let eventInstance = TestEventBase.at(n.eventAddress);

  logger.info(`Event Owner token:`, (await eventInstance.token()));
  logger.info(`Event Owner creator:`, (await eventInstance.creator()), accounts[0]);
  logger.info(`Event Owner share:`, (await eventInstance.getShare(accounts[0])).toNumber());
  logger.info(`Event Event's balance:`, (await token.balanceOf(eventInstance.address)).toNumber());
  logger.info(`Event Possible results:`, [
    (await eventInstance.deposit()).toNumber(),
    (await eventInstance.creator()),
    // await eventInstance.possibleResults(1),
    // await eventInstance.possibleResults(2),
  ]);


  // Empty event
  result = await serialityTest.testEmptyEvent({from: accounts[0], gas: 6721975});
  logger.info(`Empty Event Result:`, result);

})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });
