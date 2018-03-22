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
    await token.approve(event.address, 10000000, {from: accounts[0]});
    await event.newBet(0, 1000000, {from: accounts[0]});

    assert.equal((await event.possibleResults(0))[2], 1, 'Amount of bets is invalid');
    assert.equal((await event.possibleResults(0))[3], 1000000, 'Sum of bets is invalid');
    assert(token.balanceOf(event.address), 11000000, 'Event balance is invalid');

    await event.newBet(1, 500000, {from: accounts[0]});

    const userBets = await event.getUserBets({from: accounts[0]});
    assert.equal(userBets.length, 2, 'Count of user bets is invalid');

    let promiseUserBets = [];
    for(let i = 0; i < userBets.length; i++) {
      promiseUserBets.push(event.bets(i))
    }

    Promise.all(promiseUserBets).then((bets) => {
      assert.equal(bets[0][1], accounts[0], 'Address of better is invalid');
      assert.equal(bets[0][2], 0, 'Result of the bet is invalid');
      assert.equal(bets[0][3], 1000000, 'Amount of the bet is invalid');
      
      assert.equal(bets[1][1], accounts[0], 'Address of better is invalid');
      assert.equal(bets[1][2], 1, 'Result of the bet is invalid');
      assert.equal(bets[1][3], 500000, 'Amount of the bet is invalid');
    })
  });
});
