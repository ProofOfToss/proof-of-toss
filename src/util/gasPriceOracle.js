const _ = require('lodash');
import config from '../data/config.json'

function getBlockTransactions(web3, block) {
  let transactions = [];
  var i;

  let _getTransaction = (resolve, reject) => {
    web3.eth.getTransaction(block.transactions[i], (err, tx) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(tx);
    });
  };

  for (i = 0; i < block.transactions.length; i++) {
    transactions.push(
      new Promise(_getTransaction)
    );
  }

  return Promise.all(transactions);
}

function getLatestBlocks(web3, from, to) {
  let blocks = [];
  var i;

  let _getBlock = (resolve, reject) => {
    web3.eth.getBlock(i, (err, block) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(block);
    });
  };

  for (i = to; i > from; i--) {
    blocks.push(
      new Promise(_getBlock)
    );
  }

  return Promise.all(blocks);
}

function getGasPrice(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getGasPrice((err, avgGasPrice) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(Number(avgGasPrice));
    });
  });
}

function getBlockNumber(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, blockNumber) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(Number(blockNumber));
    });
  });
}

function getGasPrices(web3) {
  const BLOCKS_DEPTH = 10;

  var minGasPrice, avgGasPrice, maxGasPrice;

  const promise = new Promise((resolve, reject) => {
    getGasPrice(web3)
    .then(gasPrice => {
      avgGasPrice = minGasPrice = maxGasPrice = gasPrice;
      return getBlockNumber(web3);
    })
    .then(blockNumber => {
      return getLatestBlocks(web3, blockNumber - BLOCKS_DEPTH, blockNumber)
    })
    .then(blocks => {
      let allTransactions = [];
      for (let i = 0; i < blocks.length; i++) {
        if(blocks[i]) {
          allTransactions.push(getBlockTransactions(web3, blocks[i]));
        }
      }

      return Promise.all(allTransactions);
    })
    .then(transactionsByBlocks => {

      for (let i = 0; i < transactionsByBlocks.length; i++) {
        const minMax = _.reduce(transactionsByBlocks[i], ({min, max}, tx) => {

          let gasPrice = Number(tx.gasPrice);
          return {
            min: gasPrice < min ? gasPrice : min,
            max: gasPrice > max ? gasPrice : max,
          };

        }, {min: minGasPrice, max: maxGasPrice});

        minGasPrice = minMax.min;
        maxGasPrice = minMax.max;
      }

      resolve({
        min: minGasPrice,
        avg: avgGasPrice,
        max: maxGasPrice,
      });
    })
    .catch(e => reject(e))
  });

  return promise;
}

function getGasCalculation(web3, gasAmount) {
  return new Promise((resolve, reject) => {
    getGasPrices(web3)
      .then((gasPrices) => {
        const gasLimit = Math.round(Number(gasAmount) * 1.5);

        resolve({
          gasLimit: gasLimit,
          gasPrice: Math.round(gasPrices.max),
          minFee: web3.fromWei((gasLimit * gasPrices.min), 'ether'),
          fee: web3.fromWei((gasLimit * gasPrices.max), 'ether'),
          gasPriceStr: Math.round(web3.fromWei(gasPrices.avg, 'gwei')).toFixed(config.view.gwei_precision) + ' gwei'
        });
      });
  })
}

export { getGasPrices, getGasCalculation }