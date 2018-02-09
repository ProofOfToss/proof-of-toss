import expectThrow from './helpers/expectThrow';

var Crowdsale = artifacts.require("./Crowdsale.sol");
var Token = artifacts.require("./Token.sol");

var now = Math.floor((new Date()).getTime() / 1000);

contract('Token', function (accounts) {

  it("should create Crowdsale contract, which creates Token contract and transfer presale tokens", function() {

    let crowdsale, token;
    let start = now - 24*60*60, period = 30;

    return Crowdsale.new(start, period, 0, {from: accounts[0]})
      .then(function (instance) {

        crowdsale = instance;
        return crowdsale.getToken();

      }).then(function (address) {

        token = Token.at(address);
        return token.balanceOf(crowdsale.address);

      }).then(function(balanceOf) {

        assert.equal(1000000000, balanceOf.toNumber());
        return crowdsale.transferPreSaleTokens(accounts[0], 1000, {from: accounts[0]});

      }).then(async function() {

        return token.balanceOf(accounts[0]);

      }).then(async function(balanceOf) {

        assert.equal(1000, balanceOf.toNumber());
        return token.balanceOf(crowdsale.address);

      }).then(async function(balanceOf) {

        assert.equal(1000000000 - 1000, balanceOf.toNumber());

      });

  });

  it("should not transfer pre-sale tokens before presale start date", function() {

    let crowdsale, token;

    let start = now + 1000, period = 30;

    return Crowdsale.new(start, period, 0, {from: accounts[0]})
      .then(function (instance) {
        crowdsale = instance;
        return crowdsale.getToken();
      }).then(function (address) {
        token = Token.at(address);
        return token.balanceOf(crowdsale.address);
      }).then(async function(balanceOf) {
        assert.equal(1000000000, balanceOf.toNumber());

        await expectThrow(crowdsale.transferPreSaleTokens(accounts[0], 1000, {from: accounts[0]}));
      });

  });

  it("should not transfer pre-sale tokens after presale end date", function() {
    let crowdsale, token;

    let start = now - 31*24*60*60, period = 30;

    return Crowdsale.new(start, period, 0, {from: accounts[0]})
      .then(function (instance) {
        crowdsale = instance;
        return crowdsale.getToken();
      }).then(function (address) {
        token = Token.at(address);
        return token.balanceOf(crowdsale.address);
      }).then(async function(balanceOf) {
        assert.equal(1000000000, balanceOf.toNumber());

        await expectThrow(crowdsale.transferPreSaleTokens(accounts[0], 1000, {from: accounts[0]}));
      });
  });

  it("should not allow using of Tokens before presale end date", function() {
    let crowdsale, token;

    let start = now - 31*24*60*60, period = 30;

    return Crowdsale.new(start, period, 0, {from: accounts[0]})
      .then(function (instance) {
        crowdsale = instance;
        return crowdsale.getToken();
      }).then(function (address) {
        token = Token.at(address);
        return token.balanceOf(crowdsale.address);
      }).then(async function(balanceOf) {
        assert.equal(1000000000, balanceOf.toNumber());

        await expectThrow(crowdsale.transferPreSaleTokens(accounts[0], 1000, {from: accounts[0]}));
      });
  });

  it("should not allow using of Tokens if presale was not completed", function() {

    let crowdsale, token;
    let start = now - 24*60*60, period = 30;

    return Crowdsale.new(start, period, 0, {from: accounts[0]})
      .then(function (instance) {

        crowdsale = instance;
        return crowdsale.getToken();

      }).then(function (address) {

        token = Token.at(address);
        return token.balanceOf(crowdsale.address);

      }).then(async function(balanceOf) {

        assert.equal(1000000000, balanceOf.toNumber());

        await crowdsale.transferPreSaleTokens(accounts[0], 1000, {from: accounts[0]});
        await crowdsale.transferPreSaleTokens(accounts[1], 1000, {from: accounts[0]});

        assert.equal(1000, (await token.balanceOf(accounts[0])).toNumber());
        assert.equal(1000, (await token.balanceOf(accounts[1])).toNumber());
        assert.equal(1000000000 - 2000, (await token.balanceOf(crowdsale.address)).toNumber());

        await expectThrow(token.transfer(accounts[1], 1000, {from: accounts[0]}));

      });
  });

  it("should allow using of Tokens after presale end date", function() {
    let crowdsale, token;
    let start = now - 24*60*60 + 5, period = 1;

    return Crowdsale.new(start, period, 0, {from: accounts[0]})
      .then(function (instance) {

        crowdsale = instance;
        return crowdsale.getToken();

      }).then(function (address) {

        token = Token.at(address);
        return token.balanceOf(crowdsale.address);

      }).then(async function(balanceOf) {

        assert.equal(1000000000, balanceOf.toNumber());

        await crowdsale.transferPreSaleTokens(accounts[0], 1000, {from: accounts[0]});
        await crowdsale.transferPreSaleTokens(accounts[1], 1000, {from: accounts[0]});

        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              assert.equal(1000, (await token.balanceOf(accounts[0])).toNumber());
              assert.equal(1000, (await token.balanceOf(accounts[1])).toNumber());
              assert.equal(1000000000 - 2000, (await token.balanceOf(crowdsale.address)).toNumber());

              await token.transfer(accounts[1], 1000, {from: accounts[0]});
              assert.equal(2000, (await token.balanceOf(accounts[1])).toNumber());
              assert.equal(0, (await token.balanceOf(accounts[0])).toNumber());

              resolve();
            } catch (e) {
              reject(e);
            }

          }, 6000);
        });

      });
  });
});
