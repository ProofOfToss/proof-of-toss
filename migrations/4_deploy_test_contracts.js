// var VersionStorage = artifacts.require("VersionStorage");
var Token = artifacts.require("Token");
var Main = artifacts.require("Main");
var TestMainSC = artifacts.require("TestMainSC");
var TestEventBase = artifacts.require("TestEventBase");
var BlockingGranter = artifacts.require("BlockingGranter");
var Blocker = artifacts.require("Blocker");
var EventBase = artifacts.require("EventBase");
var Whitelist = artifacts.require("Whitelist");
var SerialityTest = artifacts.require("SerialityTest");

var argv = require('yargs-parser')(process.argv.slice(2));

module.exports = function(deployer) {
  if (argv._ && argv._[0] === 'test') {
    deployer.deploy(BlockingGranter, Token.address, {gasPrice: 1000});
    deployer.deploy(Blocker, Token.address, {gasPrice: 1000});
    deployer.deploy(SerialityTest, {gasPrice: 1000});

    deployer.deploy(TestEventBase, Token.address, {gasPrice: 1000}).then(function() {
      return deployer.deploy(TestMainSC, Token.address, Whitelist.address, TestEventBase.address, {gasPrice: 1000});
    });
  }
};
