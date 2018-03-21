import expectThrow from './helpers/expectThrow';

var Main = artifacts.require("./Main.sol");
var Event = artifacts.require("./Event.sol");
var Token = artifacts.require("./Token.sol");

contract('Main', function(accounts) {

  const eventName = 'Test event';
  const eventDeposit = 10000000;
  const eventDescription = 'description';

  const bidType = 'bid_type';
  const eventCategory = 'category_id';
  const eventLocale = 'en';
  const eventStartDate = '1517406195';
  const eventEndDate = '1580478195';

  const eventData = `${bidType}.${eventCategory}.${eventLocale}.${eventStartDate}.${eventEndDate}`;
  const eventSourceUrl = 'source_url';
  const eventTags = 'en.tag1_name.en.tag2_name.en.tag3_name';
  const eventResults = 'result_description_1.10.result_description_2.20';

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

    }).then(() => {

      return token.approve(main.address, 10000000, {from: accounts[0]});

    }).then(async function() {

      try {
        await main.updateWhitelist(accounts[0], true);
      } catch (e) {
        assert.isUndefined(e);
      }

      return main.newEvent(eventName, eventDeposit, eventDescription, 1, eventData,
        eventSourceUrl, eventTags, eventResults, {from: accounts[0]});

    }).then(function(eventAddress) {

      return main.getLastEvent(eventAddress);

    }).then(function(eventAddress) {

      event = Event.at(eventAddress);

      return event.getToken();

    }).then(function(tokenAddress) {

      assert.equal(tokenAddress, token.address, "event token address not equals token address");

      return event.getCreatedTimestamp();

    }).then(function(timestamp) {

      return event.getCreator();

    }).then(function(creator) {

      assert.equal(creator, accounts[0], "wrong creator");

      return event.getShare(accounts[0], {from: accounts[0]})

    }).then(function(share) {

      assert.equal(share.toNumber(), 10000000, "1000 tokens wasn't on deposit");

      return token.balanceOf(accounts[0], {from: accounts[0]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 9999980000000, "creator balance wasn't 9999980000000 tokens");

      return event.withdraw({from: accounts[0]});

    }).then(function() {

      return token.balanceOf(accounts[0], {from: accounts[0]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 9999990000000, "1000000000 tokens wasn't on balance");

      return event.getShare(accounts[0], {from: accounts[0]})

    }).then(function(share) {
      assert.equal(share.toNumber(), 0, "deposit wasn't withdrawn");

      return Promise.all([event.name(), event.deposit(), event.description(), event.bidType(),
        event.category(), event.locale(), event.startDate(), event.endDate(), event.sourceUrl()]);
    }).then((eventData) => {

      assert.equal(eventData[0], eventName, `Name is invalid`);
      assert.equal(eventData[1], eventDeposit, `Deposit is invalid`);
      assert.equal(eventData[2], eventDescription, `Description is invalid`);
      assert.equal(web3.toAscii(eventData[3]).replace(/\0/g, ''), bidType, `Bid type is invalid`);
      assert.equal(web3.toAscii(eventData[4]).replace(/\0/g, ''), eventCategory, `Category is invalid`);
      assert.equal(web3.toAscii(eventData[5]), eventLocale, `Locale is invalid`);
      assert.equal(eventData[6], eventStartDate, `Start date is invalid`);
      assert.equal(eventData[7], eventEndDate, `End date is invalid`);
      assert.equal(eventData[8], eventSourceUrl, `Source url is invalid`);

      return Promise.all([event.tags(0), event.tags(1), event.tags(2)]);
    }).then((tags) => {
      for(let i = 0; i < 3; i++) {
        assert.equal(tags[i][0], `tag${i+1}_name`, `tag ${i} name is invalid`);
        assert.equal(web3.toAscii(tags[i][1]), `en`, `tag ${i} locale name is invalid`);
      }
    }).then(() => {
      return Promise.all([event.possibleResults(0), event.possibleResults(1)]);
    }).then((possibleResults) => {
      for(let i = 0; i < 2; i++) {
        assert.equal(possibleResults[i][0], `result_description_${i+1}`, `possible result ${i} description is invalid`);
        assert.equal(possibleResults[i][1], (i+1)*10, `possible result  ${i} coefficient is invalid`);
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

    await expectThrow(main.newEvent('Test event 2', 10000000, 'description', 1, eventData, 'source_url', eventTags, eventResults, {from: accounts[1]}));
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

      await main.newEvent('Test event 3', 10000000, 'description', 1, eventData,
        'source_url', eventTags, eventResults, {from: accounts[0]});

      const eventAddress = await main.getLastEvent();
      const event = Event.at(eventAddress);
      const creator = await event.getCreator();

      assert.equal(creator, accounts[0], "wrong creator");
    } catch (e) {
      assert.isUndefined(e);
    }
  });
});
