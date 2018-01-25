import TokenContract from '../../build/contracts/Token.json'

function getMyBalance(web3) {
  const contract = require('truffle-contract');
  const token = contract(TokenContract);

  token.setProvider(web3.currentProvider);

  return token.deployed()
    .then((instance) => {
      return instance.balanceOf(web3.eth.accounts[0]);
    })
    .then((balance) => {
      return balance.toNumber();
    });
}

//TODO: get contract fromBlock, walletNumber, fee
function getMyTransactions(web3) {
  const contract = require('truffle-contract');
  const token = contract(TokenContract);

  token.setProvider(web3.currentProvider);

  return token.deployed()
    .then((instance) => {
      let items = [];

      return new Promise((resolve, reject) => {
        instance.Transfer({}, { fromBlock: 0, toBlock: 'pending' }).get(function (err, log) {
          if (err) {
            reject(err);
            return;
          }

          log.forEach(function(res) {
            var fee;

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

export { getMyBalance, getMyTransactions };
