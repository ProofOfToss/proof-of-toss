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
      const address = web3.eth.accounts[0];
      instance.Transfer({}, { fromBlock: 0, toBlock: 'pending' }, (err, res) => {
        items.push({
          time: web3.eth.getBlock(res.blockNumber).timestamp,
          type: res.args.to === address ? 'in' : 'out',
          walletNumber: res.args.to === address ? res.args.from : res.args.to,
          sum: web3.fromWei(res.args.value, 'ether').toNumber(),
          fee: calculateGasPrice(web3, res.transactionHash)
        })
      });
      return items;
    });
}

function calculateGasPrice(web3, transactionHash) {
  let fee = null;

  web3.eth.getTransaction(transactionHash)
    .then(function(transaction) {
      web3.eth.eth_getTransactionReceipt(transactionHash).then(function(transactionReceipt) {
        fee = transactionReceipt.gasUsed * transaction.gasPrice
      })
    });

  return web3.fromWei(fee, 'ether');
}

export { getMyBalance, getMyTransactions };
