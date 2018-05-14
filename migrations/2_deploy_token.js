// var VersionStorage = artifacts.require("VersionStorage");
var Token = artifacts.require("Token");
var EventBase = artifacts.require("EventBase");
var Whitelist = artifacts.require("Whitelist");

module.exports = function(deployer) {
  deployer.deploy(Token);
};
