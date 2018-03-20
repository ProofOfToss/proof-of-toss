var SerialityTest = artifacts.require("SerialityTest");
var TestEventBase = artifacts.require("TestEventBase");
var EventLib = artifacts.require("EventLib");
var Token = artifacts.require("Token");

module.exports = function(deployer) {
  deployer.deploy(EventLib);
  deployer.deploy(TestEventBase, Token.address);

  deployer.deploy(TestEventBase, Token.address).then(function() {

    return deployer.deploy(SerialityTest, Token.address, TestEventBase.address, {gasPrice: 1000});

  });
};
