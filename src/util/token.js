import TokenContract from '../../build/contracts/Token.json'

function getMyBalance(web3) {
  const contract = require('truffle-contract');
  const token = contract(TokenContract);

  // @TODO: fix me
  var web3 = window.web3;

  token.setProvider(web3.currentProvider);

  return token.deployed()
    .then((instance) => {
      return instance.balanceOf(web3.eth.accounts[0]);
    })
    .then((balance) => {
      return balance.toNumber();
    });
}

export { getMyBalance };
