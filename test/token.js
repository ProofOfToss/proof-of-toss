import expectThrow from './helpers/expectThrow';

var Token = artifacts.require("./Token.sol");

contract('Token', function (accounts) {

  it("should not allow to block tokens for the same address as msg.sender", function() {

    return Token.deployed()
      .then(async function (instance) {
        await expectThrow(instance.block(accounts[0], 1000));
      });

  });

  it("should not allow to block tokens for msg.sender who is not approved by tokens owner", function() {

    return Token.deployed()
      .then(async function (instance) {
        await expectThrow(instance.block(accounts[0], 1000, {from: accounts[1]}));
      });

  });

  it("should not allow to block tokens for msg.sender who is approved by tokens owner, but is allowed to transfer only 100 tokens of 1000", function() {

    var token;

    return Token.deployed()
      .then(function (instance) {
        token = instance;

        return token.approve(accounts[1], 100);
      })
      .then(async function () {
        await expectThrow(token.block(accounts[0], 1000, {from: accounts[1]}));
      });

  });

  it("should not allow to block tokens for msg.sender who is approved by tokens owner, but is allowed to transfer only 100 tokens of 1000", function() {

    var token;

    return Token.deployed()
      .then(function (instance) {
        token = instance;

        return token.approve(accounts[1], 100);
      })
      .then(async function() {
        await expectThrow(token.block(accounts[0], 1000, {from: accounts[1]}));
      });

  });

  it("should not allow to block tokens if blocked counts is <= 0", function() {

    return Token.deployed()
      .then(async function (instance) {
        await expectThrow(instance.block(accounts[0], 0, {from: accounts[1]}));
      });

  });

  it("should not allow to unblock tokens if user tries to unblock more tokens than is blocked", function() {

    var blockedCount = 1000;
    var ownerBalanceOf;
    var token;

    return Token.deployed()
      .then(function (instance) {
        token = instance;

        return token.balanceOf(accounts[0]);
      })
      .then(function(balanceOf) {
        ownerBalanceOf = balanceOf.toNumber();
      })
      .then(function() {
        return token.approve(accounts[1], blockedCount);
      })
      .then(function () {
        return token.allowance(accounts[0], accounts[1]);
      })
      .then(function (allowedCount) {
        assert.equal(blockedCount, allowedCount.toNumber());

        return token.block(accounts[0], blockedCount, {from: accounts[1]});
      })
      .then(function () {
        return token.allowance(accounts[0], accounts[1]);
      })
      .then(function (allowedCount) {
        assert.equal(0, allowedCount.toNumber());

        return token.balanceOf(accounts[0]);
      })
      .then(function (balanceOf) {
        assert.equal(ownerBalanceOf - blockedCount, balanceOf.toNumber());

        return token.blocked(accounts[0], accounts[1]);
      })
      .then(function (blocked) {
        assert.equal(blockedCount, blocked.toNumber());
      })
      .then(async function () {
        await expectThrow(token.unblock(accounts[0], accounts[1], blockedCount + 1, {from: accounts[1]}));
      })
      .then(function () {
        return token.unblock(accounts[0], accounts[0], blockedCount, {from: accounts[1]});
      });

  });

  it("should allow to block tokens for msg.sender who is approved by tokens owner with sufficient approved token count and than to unblock tokens", function() {

    var blockedCount = 1000;
    var ownerBalanceOf;
    var token;

    return Token.deployed()
      .then(function (instance) {
        token = instance;

        return token.balanceOf(accounts[0]);
      })
      .then(function(balanceOf) {
        ownerBalanceOf = balanceOf.toNumber();

        assert.equal(ownerBalanceOf, 1000000000);
      })
      .then(function() {
        return token.allowance(accounts[0], accounts[1]);
      })
      .then(function (allowedCount) {
        assert.equal(0, allowedCount.toNumber());
      })
      .then(function() {
        return token.blocked(accounts[0], accounts[1]);
      })
      .then(function (blocked) {
        assert.equal(0, blocked.toNumber());
      })
      .then(function() {
        return token.approve(accounts[1], blockedCount);
      })
      .then(function () {
        return token.allowance(accounts[0], accounts[1]);
      })
      .then(function (allowedCount) {
        assert.equal(blockedCount, allowedCount.toNumber());

        return token.block(accounts[0], blockedCount, {from: accounts[1]});
      })
      .then(function () {
        return token.allowance(accounts[0], accounts[1]);
      })
      .then(function (allowedCount) {
        assert.equal(0, allowedCount.toNumber());

        return token.balanceOf(accounts[0]);
      })
      .then(function (balanceOf) {
        assert.equal(ownerBalanceOf - blockedCount, balanceOf.toNumber());

        return token.blocked(accounts[0], accounts[1]);
      })
      .then(function (blocked) {
        assert.equal(blockedCount, blocked.toNumber());
      })
      .then(function () {
        return token.unblock(accounts[0], accounts[0], 300, {from: accounts[1]});
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
        return token.blocked(accounts[0], accounts[1]);
      })
      .then(function (blocked) {
        assert.equal(blockedCount - 300, blocked.toNumber());
      })
      .then(function () {
        return token.unblock(accounts[0], accounts[1], 700, {from: accounts[1]});
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
        return token.blocked(accounts[0], accounts[1]);
      })
      .then(function (blocked) {
        assert.equal(0, blocked.toNumber());
      })
      ;

  });

});
