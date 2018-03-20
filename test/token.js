import expectThrow from './helpers/expectThrow';

var Token = artifacts.require("./Token.sol");
var Blocker = artifacts.require("./test/Blocker.sol");
var BlockingGranter = artifacts.require("./test/BlockingGranter.sol");

contract('Token', function (accounts) {

  it("should add initial balance to msg.sender", async () => {
    const token = await Token.deployed();
    const balance = await token.balanceOf(accounts[0]);
    assert.equal(balance, 10000000000000, "1000000000 tokens wasn't on balance");
  });

  it("should transfer tokens between accounts", async () => {
    const token = await Token.deployed();

    //Transfer from accounts[0] to accounts[1]
    await token.transfer(accounts[1], 5000000000000, {from: accounts[0]});
    assert.equal(await token.balanceOf(accounts[1], {from: accounts[1]}), 5000000000000,
      "5000000000000 tokens wasn't on balance");

    //Transfer from accounts[1] to accounts[0]
    await token.transfer(accounts[0], 5000000000000, {from: accounts[1]});
    assert.equal(await token.balanceOf(accounts[1], {from: accounts[1]}), 0,
      "0 tokens wasn't on balance");
  });

  it("should not allow to block tokens for the same address as msg.sender", function() {

    return Token.deployed()
      .then(async function (instance) {
        await expectThrow(instance.block(accounts[0], 10000000));
      });

  });

  it("should not allow to block tokens for msg.sender who is not approved by tokens owner", function() {

    return Token.deployed()
      .then(async function (instance) {
        await expectThrow(instance.block(accounts[0], 10000000, {from: accounts[1]}));
      });

  });

  it("should not allow not granted contract to allow another contract to block tokens", function() {

    let token, granter, blocker;

    return Token.deployed()
      .then(function (instance) {
        token = instance;
        return BlockingGranter.deployed();
      }).then(function (instance) {
        granter = instance;
        return Blocker.deployed();
      }).then(async function (instance) {
        blocker = instance;

        await expectThrow(granter.grant(accounts[1], blocker.address, {from: accounts[1]}));
      });
  });

  it("should allow granted contract to allow another contract to block tokens of sender", function() {

    let token, granter, blocker;

    return Token.deployed()
      .then(function (instance) {
        token = instance;
        return BlockingGranter.deployed();
      }).then(function (instance) {
        granter = instance;
        return Blocker.deployed();
      }).then(async function (instance) {
        blocker = instance;

        return token.grantToAllowBlocking(granter.address, true, {from: accounts[0]});
      }).then(async function () {

        return token.allowanceToAllowBlocking(accounts[0], granter.address);
      }).then(async function (result) {
        assert.equal(true, result);

        return granter.grant(accounts[0], blocker.address, {from: accounts[1]}); // accounts[1] can initiate blocking of accounts[0] tokens by smart-contract
      }).then(async function () {

        return blocker.block(accounts[0], 10000000, {from: accounts[1]});
      }).then(async function() {

        return token.balanceOf(accounts[0]);
      }).then(async function(balanceOf) {
        assert.equal(balanceOf.toNumber(), 10000000000000 - 10000000);

        await blocker.unblock(accounts[0], 10000000, {from: accounts[1]});
        return token.balanceOf(accounts[0]);
      }).then(function(balanceOf) {

        assert.equal(balanceOf.toNumber(), 10000000000000);
      });
  });

  it("should not allow granted contract to allow another contract to block tokens of third person", function() {

    let token, granter, blocker;

    return Token.deployed()
      .then(function (instance) {
        token = instance;
        return BlockingGranter.deployed();
      }).then(function (instance) {
        granter = instance;
        return Blocker.deployed();
      }).then(async function (instance) {
        blocker = instance;

        return token.grantToAllowBlocking(granter.address, true, {from: accounts[0]});
      }).then(async function () {

        return token.allowanceToAllowBlocking(accounts[0], granter.address);
      }).then(async function (result) {
        assert.equal(true, result);

        return granter.grant(accounts[0], blocker.address, {from: accounts[1]});
      }).then(async function () {

        await token.generateTokens(accounts[1], 10000000);
        assert.equal(10000000, await token.balanceOf(accounts[1]));
        await expectThrow(blocker.block(accounts[1], 10000000, {from: accounts[1]})); // smart-contract was not granted to block tokens of accounts[1]
        await token.generateTokens(accounts[1], -10000000);

        return blocker.block(accounts[0], 10000000, {from: accounts[1]});
      }).then(async function() {

        return token.balanceOf(accounts[0]);
      }).then(async function(balanceOf) {
        assert.equal(balanceOf.toNumber(), 10000000000000 - 10000000);

        await blocker.unblock(accounts[0], 10000000, {from: accounts[1]});
        return token.balanceOf(accounts[0]);
      }).then(function(balanceOf) {

        assert.equal(balanceOf.toNumber(), 10000000000000);
      });
  });

  it("should not allow to block tokens if blocked counts is <= 0", function() {

    let token, granter, blocker;

    return Token.deployed()
      .then(function (instance) {
        token = instance;
        return BlockingGranter.deployed();
      }).then(function (instance) {
        granter = instance;
        return Blocker.deployed();
      }).then(async function (instance) {
        blocker = instance;
        return token.grantToAllowBlocking(granter.address, true, {from: accounts[0]});
      }).then(async function () {
        return granter.grant(accounts[0], blocker.address, {from: accounts[1]});
      })
      .then(async function (instance) {
        await expectThrow(blocker.block(accounts[0], 0, {from: accounts[1]}));
      });
  });

  it("should not allow to unblock tokens if user tries to unblock more tokens than is blocked", function() {

    let blockedCount = 10000000;
    let ownerBalanceOf;
    let token, granter, blocker;

    return Token.deployed()
      .then(function (instance) {
        token = instance;
        return token.balanceOf(accounts[0]);
      })
      .then(function(balanceOf) {
        ownerBalanceOf = balanceOf.toNumber();
        return BlockingGranter.deployed();
      })
      .then(function (instance) {
        granter = instance;
        return Blocker.deployed();
      })
      .then(function (instance) {
        blocker = instance;
        return token.grantToAllowBlocking(granter.address, true, {from: accounts[0]});
      })
      .then(function () {
        return granter.grant(accounts[0], blocker.address, {from: accounts[1]});
      })
      .then(function () {
        return blocker.block(accounts[0], blockedCount, {from: accounts[1]});
      })
      .then(function () {
        return token.balanceOf(accounts[0]);
      })
      .then(function (balanceOf) {
        assert.equal(ownerBalanceOf - blockedCount, balanceOf.toNumber());

        return token.blocked(accounts[0], blocker.address);
      })
      .then(function (blocked) {
        assert.equal(blockedCount, blocked.toNumber());
      })
      .then(async function () {
        await expectThrow(blocker.unblock(accounts[0], blockedCount + 1, {from: accounts[1]}));

        return blocker.unblock(accounts[0], blockedCount, {from: accounts[1]});
      })
      .then(async function () {
        assert.equal(0, await token.blocked(accounts[0], blocker.address));
        assert.equal(ownerBalanceOf, await token.balanceOf(accounts[0]));
      });

  });

  it("should allow to block tokens for msg.sender who is approved by tokens owner with sufficient approved token count and than to unblock tokens", function() {
    let blockedCount = 1000;
    let ownerBalanceOf;
    let currentBlock = Token.web3.eth.blockNumber;
    let token, granter, blocker;

    return Token.deployed()
      .then(function (instance) {
        token = instance;
        return token.balanceOf(accounts[0]);
      })
      .then(function(balanceOf) {
        ownerBalanceOf = balanceOf.toNumber();
        return BlockingGranter.deployed();
      })
      .then(function (instance) {
        granter = instance;
        return Blocker.deployed();
      })
      .then(function (instance) {
        blocker = instance;
        return token.grantToAllowBlocking(granter.address, true, {from: accounts[0]});
      })
      .then(function () {
        return granter.grant(accounts[0], blocker.address, {from: accounts[1]});
      })
      .then(function () {
        return blocker.block(accounts[0], blockedCount, {from: accounts[1]});
      })
      .then(function () {
        return token.balanceOf(accounts[0]);
      })
      .then(function (balanceOf) {
        assert.equal(ownerBalanceOf - blockedCount, balanceOf.toNumber());

        return token.blocked(accounts[0], blocker.address);
      })
      .then(function (blocked) {
        assert.equal(blockedCount, blocked.toNumber());
      })
      .then(function () {
        return blocker.unblock(accounts[0], 300, {from: accounts[1]});
      })
      .then(function () {
        return token.balanceOf(accounts[0]);
      })
      .then(function (balanceOf) {
        assert.equal(ownerBalanceOf - blockedCount + 300, balanceOf.toNumber());
      })
      .then(function () {
        return token.balanceOf(accounts[1]);
      })
      .then(function (balanceOf) {
        assert.equal(0, balanceOf.toNumber());
      })
      .then(function () {
        return token.blocked(accounts[0], blocker.address);
      })
      .then(function (blocked) {
        assert.equal(blockedCount - 300, blocked.toNumber());
      })
      .then(function () {
        return blocker.unblockTo(accounts[0], accounts[1], 700, {from: accounts[1]});
      })
      .then(function () {
        return token.balanceOf(accounts[0]);
      })
      .then(function (balanceOf) {
        assert.equal(ownerBalanceOf - blockedCount + 300, balanceOf.toNumber());
      })
      .then(function () {
        return token.balanceOf(accounts[1]);
      })
      .then(function (balanceOf) {
        assert.equal(700, balanceOf.toNumber());
      })
      .then(function () {
        return token.blocked(accounts[0], blocker.address);
      })
      .then(async function (blocked) {
        assert.equal(0, blocked.toNumber());

        let operations = await token.TokenOperationEvent({}, {fromBlock: currentBlock + 1, toBlock: 'latest'});

        return new Promise((resolve, reject) => {
          operations.get(function (error, log) {
            assert.equal(null, error);
            assert.equal(5, log.length);

            assert.equal('grant_allow_blocking', log[0].args.operation);
            assert.equal(accounts[0], log[0].args.from);
            assert.equal(granter.address, log[0].args.to);
            assert.equal(0, log[0].args.value.toNumber());

            assert.equal('allow_blocking', log[1].args.operation);
            assert.equal(accounts[0], log[1].args.from);
            assert.equal(blocker.address, log[1].args.to);
            assert.equal(0, log[1].args.value.toNumber());

            assert.equal('block', log[2].args.operation);
            assert.equal(accounts[0], log[2].args.from);
            assert.equal(0, log[2].args.to);
            assert.equal(1000, log[2].args.value.toNumber());
            assert.equal(blocker.address, log[2].args._contract);

            assert.equal('unblock', log[3].args.operation);
            assert.equal(accounts[0], log[3].args.from);
            assert.equal(accounts[0], log[3].args.to);
            assert.equal(300, log[3].args.value.toNumber());
            assert.equal(blocker.address, log[3].args._contract);

            assert.equal('unblock', log[4].args.operation);
            assert.equal(accounts[0], log[4].args.from);
            assert.equal(accounts[1], log[4].args.to);
            assert.equal(700, log[4].args.value.toNumber());
            assert.equal(blocker.address, log[4].args._contract);

            resolve();
          });
        });
      });
  });
});
