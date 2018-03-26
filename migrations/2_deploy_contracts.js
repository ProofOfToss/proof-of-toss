// var VersionStorage = artifacts.require("VersionStorage");
var Token = artifacts.require("Token");
var Main = artifacts.require("Main");
var EventBase = artifacts.require("EventBase");
var Whitelist = artifacts.require("Whitelist");

module.exports = function(deployer) {
  deployer.deploy(Token, 0, 0, {gasPrice: 1000}).then(function() {
    return deployer.deploy(EventBase, Token.address, {gasPrice: 1000});
  }).then(function() {
    return deployer.deploy(Whitelist, {gasPrice: 1000});
  }).then(function() {
    return deployer.deploy(Main, Token.address, Whitelist.address, EventBase.address, {gasPrice: 1000});
  });
};
