import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';
import {toBytesTruffle as toBytes} from '../src/util/serialityUtil';

var Main = artifacts.require("./Main.sol");
var EventBase = artifacts.require("./EventBase.sol");
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

      return token.transferERC223(main.address, eventDeposit, bytes, {
        from: accounts[0]
      });

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
    });
  });

  it("should add new bet", async () => {

    const bytes = toBytes(
      {type: 'uint', size: 8, value: 1}, // action – bet
      {type: 'uint', size: 8, value: 0}, // result index
    );

    await token.transferERC223(
      event.address,
      1000000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    );

    assert.equal((await event.possibleResults(0))[1].toNumber(), 1, 'Amount of bets is invalid');
    assert.equal((await event.possibleResults(0))[2].toNumber(), 1000000, 'Sum of bets is invalid');
    assert.equal((await token.balanceOf(event.address)).toNumber(), 11000000, 'Event balance is invalid');

    await token.transferERC223(
      event.address,
      500000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 1}, // result index
      ),
      {from: accounts[0]}
    );

    const userBets = await event.getUserBets({from: accounts[0]});

    assert.equal(userBets.length, 2, 'Count of user bets is invalid');

    let promiseUserBets = [];
    for(let i = 0; i < userBets.length; i++) {
      promiseUserBets.push(event.bets(i))
    }

    Promise.all(promiseUserBets).then((bets) => {
      assert.equal(bets[0][1], accounts[0], 'Address of better is invalid');
      assert.equal(bets[0][2].toNumber(), 0, 'Result of the bet is invalid');
      assert.equal(bets[0][3].toNumber(), 1000000, 'Amount of the bet is invalid');
      
      assert.equal(bets[1][1], accounts[0], 'Address of better is invalid');
      assert.equal(bets[1][2].toNumber(), 1, 'Result of the bet is invalid');
      assert.equal(bets[1][3].toNumber(), 500000, 'Amount of the bet is invalid');
    })
  });
});
