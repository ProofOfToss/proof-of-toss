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
    deployer.deploy(BlockingGranter, Token.address);
    deployer.deploy(Blocker, Token.address);
    deployer.deploy(SerialityTest);

    deployer.deploy(TestEventBase, Token.address).then(function() {
      return deployer.deploy(TestMainSC, Token.address, Whitelist.address, TestEventBase.address);
    });
  }
};
