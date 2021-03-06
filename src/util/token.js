import {getBuiltContract} from './buildDir';
import config from '../data/config.json';
import { deployed } from "./contracts";
import BigNumber from './bignumber';

const MainContract = getBuiltContract('Main');
const TokenContract = getBuiltContract('Token');

const contract = require('truffle-contract');
const main = contract(MainContract);
const token = contract(TokenContract);

function formatWithdrawal(withdrawalSum, formatPrecision) {
  if (typeof formatPrecision === 'undefined') {
    formatPrecision = config.view.withdrawal_precision;
  }

  return (new BigNumber(withdrawalSum)).toFixed(formatPrecision).replace(/\.?0+$/, '');
}

function formatBalance(balance, formatPrecision) {
  if (typeof formatPrecision === 'undefined') {
    formatPrecision = config.view.currency_precision;
  }

  return (new BigNumber(balance))
    .div(Math.pow(10, config.view.token_precision))
    .toFixed(formatPrecision)
    .replace(/\.?0+$/, '');
}

function denormalizeBalance(balance) {
  return (new BigNumber(balance)).times(Math.pow(10, config.view.token_precision));
}

function getMyBalance(web3, address) {
  token.setProvider(web3.currentProvider);

  return token.deployed()
    .then((instance) => {
      return instance.balanceOf(address);
    })
    .then((balance) => {
      return balance.toNumber();
    });
}

function getDecimals(web3) {
  token.setProvider(web3.currentProvider);

  return token.deployed()
    .then((instance) => {
      return instance.decimals();
    })
    .then((decimals) => {
      return decimals.toNumber();
    });
}

//TODO: get contract fromBlock, walletNumber, fee
function getMyTransactions(web3, filter = {}) {
  const contract = require('truffle-contract');
  const token = contract(TokenContract);

  token.setProvider(web3.currentProvider);

  return token.deployed().then((instance) => {
      let items = [];

      return new Promise((resolve, reject) => {
        instance.Transfer(filter, {fromBlock: 0, toBlock: 'pending' }).get(function (err, log) {
          if (err) {
            reject(err);
            return;
          }

          log.forEach(function(res) {
            let fee;

            items.push(calculateGasPrice(web3, res.transactionHash)
              .then(_fee => {
                fee = _fee;

                return new Promise((_resolve, _reject) => {
                  web3.eth.getBlock(res.blockNumber, (err, block) => {
                    if (err) {
                      _reject(err);
                      return;
                    }

                    _resolve(block.timestamp)
                  });
                })
              })
              .then(timestamp => {
                return {
                  time: new Date(timestamp * 1000),
                  to: res.args.to,
                  from: res.args.from,
                  sum: res.args.value.toNumber(),
                  fee: fee
                };
              })
              .catch(e => reject(e))
            );
          });

          Promise.all(items)
            .then(_items => {
              resolve(_items);
            })
            .catch(e => reject(e));
        });
      });
    });
}

function calculateGasPrice(web3, transactionHash) {
  return new Promise((resolve, reject) => {
    web3.eth.getTransaction(transactionHash, (err, transaction) => {
      if (err) {
        reject(err);
        return;
      }

      web3.eth.getTransactionReceipt(transactionHash, (err, transactionReceipt) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(web3.fromWei(transactionReceipt.gasUsed * transaction.gasPrice, 'ether'));
      });
    });
  });
}

function getMyBlockedBalance(/*web3*/) {
  return Promise.resolve(1); // TODO Real logic after smart-contract implementation
}

function getMySBTCBalance(web3, address) {
  const promise = new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (error, balance) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(web3.fromWei(balance, 'ether'));
    });
  });

  return promise;
}

function getMyAllowance(web3, address) {
  main.setProvider(web3.currentProvider);
  token.setProvider(web3.currentProvider);

  return main.deployed().then((mainInstance) => {
    return token.deployed()
      .then((instance) => {
        return instance.allowance(address, mainInstance.address);
      })
      .then((allowance) => {
        return allowance.toNumber();
      });
  })
}

export async function canSendTokens(web3, address) {
  const tokenInstance = (await deployed(web3, 'token')).tokenInstance;
  const paused = await tokenInstance.paused();

  if(paused) {
    return await tokenInstance.unpausedWallet(address);
  }

  return true;
}

export {
  getMyBalance,
  getMyAllowance,
  getMyBlockedBalance,
  getMySBTCBalance,
  getMyTransactions,
  getDecimals,
  formatWithdrawal,
  formatBalance,
  denormalizeBalance,
  calculateGasPrice
};
