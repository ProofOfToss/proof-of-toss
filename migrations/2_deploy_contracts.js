// var VersionStorage = artifacts.require("VersionStorage");
var Token = artifacts.require("Token");
var Main = artifacts.require("Main");
var BlockingGranter = artifacts.require("BlockingGranter");
var Blocker = artifacts.require("Blocker");

module.exports = function(deployer) {
  deployer.deploy(Token, {gasPrice: 1000}).then(function() {

    if (true/* || process.env.NODE_ENV === 'test'*/) {
      deployer.deploy(BlockingGranter, Token.address, {gasPrice: 1000});
      deployer.deploy(Blocker, Token.address, {gasPrice: 1000});
    }

    return deployer.deploy(Main, Token.address, {gasPrice: 1000});
  });
};
