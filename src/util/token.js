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

function getMyBlockedBalance(/*web3*/) {
  return Promise.resolve(0.1); // TODO Real logic after smart-contract implementation
}

function getMySBTCBalance(web3) {
  const promise = new Promise((resolve, reject) => {
    web3.eth.getBalance(web3.eth.accounts[0], (error, balance) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(web3.fromWei(balance, 'ether'));
    });
  });

  return promise;
}

export { getMyBalance, getMyBlockedBalance, getMySBTCBalance };
