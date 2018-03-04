var Main = artifacts.require("./Main.sol");
var Event = artifacts.require("./Event.sol");
var Token = artifacts.require("./Token.sol");

contract('Main', function(accounts) {
  it("should create new event and tranfer deposit. then deposit should returns", function() {
    var main, token, event;

    const eventName = 'Test event';
    const eventDeposit = 1000;
    const eventDescription = 'description';

    const eventCategory = 'category_id';
    const eventLocale = 'en';
    const eventStartDate = '1517406195';
    const eventEndDate = '1580478195';

    const eventData = `${eventCategory}.${eventLocale}.${eventStartDate}.${eventEndDate}`;
    const eventSourceUrl = 'source_url';
    const tags = 'en.tag1_name.en.tag2_name.en.tag3_name';
    const results = 'result_description_1.10.result_description_2.20';


    Token.deployed().then(function(instance) {
      token = instance;
    });

    return Main.deployed().then(function(instance) {

      main = instance;

      return main.getToken();

    }).then(function(tokenAddress) {

      assert.equal(tokenAddress, token.address, "mainSC token address not equals token address");

      return token.balanceOf(accounts[0], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance, 1000000000, "1000000000 tokens wasn't on balance");

      return token.transfer(accounts[1], 1000000000, {from: accounts[0]});

    }).then(function() {

      return token.balanceOf(accounts[1], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 1000000000, "1000000000 tokens wasn't on account[1] balance");

      return token.approve(main.address, 1000, {from: accounts[1]});

    }).then(function() {

      return main.newEvent(eventName, eventDeposit, eventDescription, 1, eventData,
        eventSourceUrl, tags, results, {from: accounts[1]});

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

      assert.equal(creator, accounts[1], "wrong creator");

      return event.getShare(accounts[1], {from: accounts[1]})

    }).then(function(share) {

      assert.equal(share.toNumber(), 1000, "1000 tokens wasn't on deposit");

      return token.balanceOf(accounts[1], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 999999000, "creator balance wasn't 999999000 tokens");

      return event.withdraw({from: accounts[1]});

    }).then(function() {

      return token.balanceOf(accounts[1], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 1000000000, "1000000000 tokens wasn't on balance");

      return event.getShare(accounts[1], {from: accounts[1]})

    }).then(function(share) {
      assert.equal(share.toNumber(), 0, "deposit wasn't withdrawn");

      return Promise.all([event.name(), event.deposit(), event.description(),
        event.category(), event.locale(), event.startDate(), event.endDate(), event.sourceUrl()]);
    }).then((eventData) => {

      assert.equal(eventData[0], eventName, `Name is invalid`);
      assert.equal(eventData[1], eventDeposit, `Deposit is invalid`);
      assert.equal(eventData[2], eventDescription, `Description is invalid`);
      assert.equal(web3.toAscii(eventData[3]).replace(/\0/g, ''), eventCategory, `Category is invalid`);
      assert.equal(web3.toAscii(eventData[4]), eventLocale, `Locale is invalid`);
      assert.equal(eventData[5], eventStartDate, `Start date is invalid`);
      assert.equal(eventData[6], eventEndDate, `End date is invalid`);
      assert.equal(eventData[7], eventSourceUrl, `Source url is invalid`);

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
});
