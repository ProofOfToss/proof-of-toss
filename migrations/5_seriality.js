var SerialityTest = artifacts.require("SerialityTest");
var EventLib = artifacts.require("EventLib");
var Token = artifacts.require("Token");

module.exports = function(deployer) {
  deployer.deploy(EventLib);

  return deployer.deploy(SerialityTest, Token.address, {gasPrice: 1000});
};
