// var VersionStorage = artifacts.require("VersionStorage");
var Token = artifacts.require("Token");
var Main = artifacts.require("Main");

module.exports = function(deployer) {
  deployer.deploy(Token, {gasPrice: 0}).then(function() {
    return deployer.deploy(Main, Token.address, {gasPrice: 0});
  });
};
