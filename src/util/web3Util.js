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

export function decodeEventMethod() {
  const abiDecoder = require('abi-decoder');
  abiDecoder.addABI(EventBase.abi);
  abiDecoder.addABI(Token.abi);
  var t = web3.eth.getTransaction(log[log.length-1].transactionHash);
  var decodedData = abiDecoder.decodeMethod(t.input);

  /**
   * { name: 'transferToContract',
  params:
   [ { name: '_to',
       value: '0x459bf2209fd41b43e0d2160f33e3b813e78f11a0',
       type: 'address' },
     { name: '_value', value: '59', type: 'uint256' },
     { name: '_data',
       value: '0x6277746305e309712dc20d4a5734a0ca212e83e9aeb8b492b23368e5a013c466c60b846f2b90b88883d6ebd7436d3c030ec520521640178e349d98d07fd33ba0dd25d7305163a3fac709edd8abc2a0c13649e5eca09820995142d5f099e78874c26eb44537b03cb208b32e833f8a054c5b9f4c2e81dbc364ce61464885f387c7e8f0d3cf164a6bf4f61528f1aaf8db7955711bd620415ccc871def7f51e6457a1812669cb9b4c56fbd0664b4e10299f85b0000b00000000000000003000000000000000200000000000000010303000000005ae6db9b000000005ae6db91',
       type: 'bytes' } ] }
   */
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
