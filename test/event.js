import expectThrow from './helpers/expectThrow';

var Main = artifacts.require("./Main.sol");
var Event = artifacts.require("./Event.sol");
var Token = artifacts.require("./Token.sol");

contract('Event', function(accounts) {

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

  let main, token, event;

  beforeEach(function() {
    Token.deployed().then(function(instance) {
      token = instance;
    });

    return Main.deployed().then(function(instance) {
      main = instance;
      return main.getToken();
    }).then(function() {
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
    });
  });

  it("should add new bet", async () => {
    await token.approve(event.address, 10100000, {from: accounts[0]});

    const result = await event.newBet(0, 5000000, {from: accounts[0]});
    assert.equal(result[0], 1, 'Amount of bets is invalid');
    assert.equal(result[1], 5000000, 'Sum of bets is invalid');
    assert(token.balanceOf(event.address), 15000000, 'Event balance is invalid');
  })
});
