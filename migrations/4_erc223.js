var Token = artifacts.require("Token");

module.exports = function(deployer) {
  return deployer.deploy(Token, 0, 0, {gasPrice: 1000});
};
