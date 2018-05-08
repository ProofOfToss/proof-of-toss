import _ from "lodash";
import SolidityCoder from 'web3/lib/solidity/coder';

export function decodeEvent(web3, logs, contract, eventName) {
  const abi = _.find(contract.abi, (_abi) => _abi.type === 'event' && _abi.name === eventName);

  if (!abi) {
    throw new Error('Invalid contract');
  }

  const signature = abi.name + "(" + abi.inputs.map(function(input) {return input.type;}).join(",") + ")";
  const hash = web3.sha3(signature);

  let log;

  for (let i = 0; i < logs.length; i++) {
    if (logs[i].topics[0] === hash) {
      log = logs[i];
      break;
    }
  }

  if (!log) {
    throw new Error('Invalid logs');
  }

  const inputs = abi.inputs.reduce((accumulator, input) => {
    if(!input.indexed) {
      accumulator.push(input.type);
    }

    return accumulator;
  }, []);
  const data = SolidityCoder.decodeParams(inputs, log.data.replace('0x', ''));

  let dataIndex = 0, topicIndex = 1;

  return abi.inputs.reduce((accumulator, input) => {
    if(input.indexed) {
      accumulator[input.name] = log.topics[topicIndex++];
    } else {
      accumulator[input.name] = data[dataIndex++];
    }

    return accumulator;
  }, {});
}

export function decodeEventMethod(EventBase, Token, transactionInput) {
  const abiDecoder = require('abi-decoder');
  abiDecoder.addABI(EventBase.abi);
  abiDecoder.addABI(Token.abi);

  const decodedData = abiDecoder.decodeMethod(transactionInput);

  return decodedData;
}

export default function callAsync(method) {
  return new Promise((resolve, reject) => {
    method((error, result) => {
      if (error) {
        return reject(error);
      }

      resolve(result);
    });
  });
}
