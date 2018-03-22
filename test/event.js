import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';

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
  const eventStartDate = 1517406195;
  const eventEndDate = 1580478195;

  const eventSourceUrl = 'source_url';
  const eventTags = ['tag1_name', 'tag2_name', 'tag3_name'];
  const eventResults = [{description: 'result_description_1', coefficient: 10}, {description: 'result_description_2', coefficient: 20}];

  const bytes = serializeEvent({
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
  });


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

      token.transferERC223.estimateGas(main.address, eventDeposit, bytes, {
        from: accounts[0]
      })

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
