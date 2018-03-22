import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';

var Main = artifacts.require("./Main.sol");
var EventBase = artifacts.require("./EventBase.sol");
var Token = artifacts.require("./Token.sol");

contract('Main', function(accounts) {

  const eventName = 'Test event';
  const eventDeposit = 10000000;
  const eventDescription = 'description';

  const bidType = 'bid_type';
  const eventCategory = 'category_id';
  const eventLocale = 'en';
  const eventStartDate = 1517406195;
  const eventEndDate = 1580478195;

  const eventSourceUrl = 'source_url';
  const eventTags = ['tag1_name', 'tag2_name', 'tag3_name'];
  const eventResults = [{description: 'result_description_1', coefficient: 10}, {description: 'result_description_2', coefficient: 20}];

  const eventData = {
    name: eventName,
    description: eventDescription,
    deposit: eventDeposit,
    bidType: bidType,
    category: eventCategory,
    locale: eventLocale,
    startDate: eventStartDate,
    endDate: eventEndDate,
    sourceUrl: eventSourceUrl,
    tags: eventTags,
    results: eventResults,
  };

  it("should create new event and tranfer deposit. then deposit should returns", function() {
    var main, token, event;

    Token.deployed().then(function(instance) {
      token = instance;
    });

    return Main.deployed().then(function(instance) {

      main = instance;

      return main.getToken();

    }).then(function(tokenAddress) {

      assert.equal(tokenAddress, token.address, "mainSC token address not equals token address");

    }).then(async function() {

      try {
        await main.updateWhitelist(accounts[0], true);
      } catch (e) {
        assert.isUndefined(e);
      }

      const transactionResult = await token.transferERC223(main.address, eventDeposit, serializeEvent(eventData), {
        from: accounts[0]
      });

      return transactionResult;
    }).then(async function(transactionResult) {

      const events = await new Promise((resolve, reject) => {
        main.NewEvent({}, {fromBlock: transactionResult.receipt.blockNumber, toBlock: 'pending', topics: transactionResult.receipt.logs[0].topics}).get((error, log) => {
          if (error) {
            reject(error);
          }

          if (log[0].transactionHash === transactionResult.tx) {
            resolve(log);
          }
        });
      });

      return events[0].args.eventAddress;

    }).then(function(eventAddress) {

      event = EventBase.at(eventAddress);

      return event.token();

    }).then(function(tokenAddress) {

      assert.equal(tokenAddress, token.address, "event token address not equals token address");

      return event.creator();

    }).then(function(creator) {

      assert.equal(creator, accounts[0], "wrong creator");

      return event.getShare(accounts[0], {from: accounts[0]})

    }).then(function(share) {

      assert.equal(share.toNumber(), 10000000, "1000 tokens wasn't on deposit");

      return token.balanceOf(accounts[0], {from: accounts[0]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 9999990000000, "creator balance wasn't 9999980000000 tokens");

      return event.withdraw({from: accounts[0]});

    }).then(function() {

      return token.balanceOf(accounts[0], {from: accounts[0]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 10000000000000, "1000000000 tokens wasn't on balance");

      return event.getShare(accounts[0], {from: accounts[0]})

    }).then(function(share) {
      assert.equal(share.toNumber(), 0, "deposit wasn't withdrawn");

      return Promise.all([event.deposit(), event.startDate(), event.endDate(), event.resultsCount()]);
    }).then((eventData) => {

      assert.equal(eventData[0], eventDeposit, `Deposit is invalid`);
      assert.equal(eventData[1], eventStartDate, `Start date is invalid`);
      assert.equal(eventData[2], eventEndDate, `End date is invalid`);
      assert.equal(eventData[3].toNumber(), 2, `Results count is invalid`);

      return Promise.all([event.possibleResults(0), event.possibleResults(1)]);
    }).then((possibleResults) => {

      for(let i = 0; i < 2; i++) {
        assert.equal(eventResults[i].coefficient, possibleResults[i][0], `result ${i} coefficient is invalid`);
      }

    });
  });

  it("should not allow to create event to users not in whitelist", async function() {
    const token = await Token.deployed();
    const main = await Main.deployed();

    try {
      await token.approve(main.address, 10000000, {from: accounts[1]});
      await main.updateWhitelist(accounts[1], false);
    } catch (e) {
      assert.isUndefined(e);
    }

    eventData.name = 'Test event 2';

    await expectThrow(token.transferERC223(main.address, eventDeposit, serializeEvent(eventData), {from: accounts[1]}));
  });

  it("should allow to create event to users in whitelist", async function() {
    const token = await Token.deployed();
    const main = await Main.deployed();

    try {
      await token.approve(main.address, 10000000, {from: accounts[0]});
    } catch (e) {
      assert.isUndefined(e);
    }

    await expectThrow(main.updateWhitelist(accounts[1], true, {from: accounts[1]})); // Non owner can't change whitelist

    try {
      await main.updateWhitelist(accounts[0], true);

      eventData.name = 'Test event 3';

      const transactionResult = await token.transferERC223(main.address, eventDeposit, serializeEvent(eventData), {from: accounts[0]});

      const events = await new Promise((resolve, reject) => {
        main.NewEvent({}, {fromBlock: transactionResult.receipt.blockNumber, toBlock: 'pending', topics: transactionResult.receipt.logs[0].topics}).get((error, log) => {
          if (error) {
            reject(error);
          }

          if (log[0].transactionHash === transactionResult.tx) {
            resolve(log);
          }
        });
      });

      const eventAddress = events[0].args.eventAddress;
      const event = EventBase.at(eventAddress);
      const creator = await event.creator();

      assert.equal(creator, accounts[0], "wrong creator");
    } catch (e) {
      assert.isUndefined(e);
    }
  });
});
