import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';
import {toBytesTruffle as toBytes} from '../src/util/serialityUtil';
import {AwsEsPublicClient} from '../src/util/esClient';
import {IndexingUtil} from '../src/util/indexingUtil';
import appConfig from '../src/data/config.json';
import log4js from 'log4js';

log4js.configure({
  appenders: {
    elasticsearch: { type: 'stdout' },
  },
  categories: { default: { appenders: ['elasticsearch'], level: 'debug' } }
});
const logger = log4js.getLogger('elasticsearch');

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix + '_test';
const TAG_INDEX = 'toss_tag_' + appConfig.elasticsearch.indexPostfix + '_test';
const BET_INDEX = 'toss_bet_' + appConfig.elasticsearch.indexPostfix + '_test';

var Main = artifacts.require("./test/TestMainSC.sol");
var EventBase = artifacts.require("./test/TestEventBase.sol");
var Token = artifacts.require("./token-sale-contracts/TokenSale/Token/Token.sol");
var Whitelist = artifacts.require("./Whitelist.sol");

const esClient = new AwsEsPublicClient(
  { log: 'error' },
  appConfig.elasticsearch.esNode,
  appConfig.elasticsearch.region,
  appConfig.elasticsearch.useSSL
);

const indexingUtil = new IndexingUtil(
  EVENT_INDEX,
  TAG_INDEX,
  BET_INDEX,
  esClient,
  logger,
  Main.web3,
  {
    Token,
    Main,
    EventBase,
  },
  true
);

contract('Event', function(accounts) {

  const now = Math.floor((new Date()).getTime() / 1000);

  const eventName = 'Test event';
  const eventDeposit = 10000000;
  const eventDescription = 'description';

  const bidType = 'bid_type';
  const eventCategory = 'category_id';
  const eventLocale = 'en';
  const eventStartDate = now + 7 * 24 * 3600;
  const eventEndDate = eventStartDate + 3600;

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


  let main, token, event, whitelist, eventBase;

  beforeEach(async function() {
    token = await Token.deployed();
    whitelist = await Whitelist.deployed();
    eventBase = await EventBase.deployed();

    await token.setPause(false);
    await token.mint(accounts[0], 10000000000000);

    return Main.deployed().then(function(instance) {
      main = instance;
      return main.getToken();
    }).then(function() {
      return token.approve(main.address, 10000000, {from: accounts[0]});
    }).then(async function() {
      try {
        await whitelist.updateWhitelist(accounts[0], true);
      } catch (e) {
        assert.isUndefined(e);
      }

      return token.transferToContract(main.address, eventDeposit, bytes, {
        from: accounts[0]
      });

    }).then(async function(transactionResult) {

      console.log(transactionResult.receipt.logs);

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

    await token.transferToContract(
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

    await token.transferToContract(
      event.address,
      500000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 1}, // result index
      ),
      {from: accounts[0]}
    );

    const userBets = await event.getUserBets(accounts[0]);

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
    });

    await event.setStartDate(now + 120);
    await expectThrow(token.transferToContract(
      event.address,
      1000000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    ));
  });

  it("should receive result from administrator", async () => {
    await whitelist.updateWhitelist(accounts[0], true);

    assert.equal(await event.getState(), 1, 'Event state must be Published');
    assert.equal(await event.resolvedResult(), 255, 'Event result must be empty');

    await token.transferToContract(
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

    assert.equal(await event.getState(), 2, 'Event state must be Accepted');

    await expectThrow(event.resolve(1));

    await event.setStartDate(now - 120);
    assert.equal(await event.getState(), 3, 'Event state must be Started');

    await expectThrow(event.resolve(1));

    await event.setEndDate(now - 60);
    assert.equal(await event.getState(), 4, 'Event state must be Finished');

    const txResult = await event.resolve(1);
    assert.equal(await event.resolvedResult(), 1, 'Event result must be 1');
    assert.equal(await event.getState(), 5, 'Event state must be Closed');

    assert.equal(txResult.logs[0].event, 'Updated', 'Updated event should be raised');
    assert.equal(txResult.logs[0].args._contract, event.address, 'Updated event should contain event address');
  });

  it("should not receive result from non-administrator", async () => {
    await whitelist.updateWhitelist(accounts[0], false);

    assert.equal(await event.getState(), 1, 'Event state must be Published');
    assert.equal(await event.resolvedResult(), 255, 'Event result must be empty');

    await token.transferToContract(
      event.address,
      1000000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    );

    await event.setStartDate(now - 120);
    await event.setEndDate(now - 60);
    assert.equal(await event.getState(), 4, 'Event state must be Finished');

    await expectThrow(event.resolve(1));
  });


  it("should withdraw winner prize", async () => {
    await whitelist.updateWhitelist(accounts[0], true);

    assert.equal(await event.getState(), 1, 'Event state must be Published');
    assert.equal(await event.resolvedResult(), 255, 'Event result must be empty');

    await token.mint(accounts[2], 1000000);
    await token.mint(accounts[3], 1000000);

    await token.transferToContract(
      event.address,
      1000000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[2]}
    );

    await token.transferToContract(
      event.address,
      1000000,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 1}, // result index
      ),
      {from: accounts[3]}
    );

    assert.equal((await event.possibleResults(0))[1].toNumber(), 1, 'Amount of bets is invalid');
    assert.equal((await event.possibleResults(0))[2].toNumber(), 1000000, 'Sum of bets is invalid');
    assert.equal((await event.possibleResults(1))[1].toNumber(), 1, 'Amount of bets is invalid');
    assert.equal((await event.possibleResults(1))[2].toNumber(), 1000000, 'Sum of bets is invalid');
    assert.equal((await token.balanceOf(event.address)).toNumber(), 12000000, 'Event balance is invalid');

    assert.equal(await event.getState(), 2, 'Event state must be Accepted');

    await expectThrow(event.resolve(1));

    await event.setStartDate(now - 120);
    assert.equal(await event.getState(), 3, 'Event state must be Started');

    await expectThrow(event.resolve(1));

    await event.setEndDate(now - 60);
    assert.equal(await event.getState(), 4, 'Event state must be Finished');

    const txResult = await event.resolve(1);
    assert.equal(await event.resolvedResult(), 1, 'Event result must be 1');
    assert.equal(await event.getState(), 5, 'Event state must be Closed');

    assert.equal(txResult.logs[0].event, 'Updated', 'Updated event should be raised');
    assert.equal(txResult.logs[0].args._contract, event.address, 'Updated event should contain event address');


    await event.withdraw({from: accounts[2]});
    await event.withdraw({from: accounts[3]});
    await event.withdraw({from: accounts[0]});

    assert.equal((await token.balanceOf(accounts[2])).toNumber(), 0, 'Looser balance is invalid');
    assert.equal((await token.balanceOf(accounts[3])).toNumber(), 2000000 * 0.99, 'Winner balance is invalid');

    assert.equal((await token.balanceOf(event.address)).toNumber(), 0, 'Event balance is invalid');
  });


  it("should index bets", async () => {
    await token.mint(accounts[1], 10000000);

    await indexingUtil.syncIndeces(true);

    let events = main.NewEvent({}, {fromBlock: 0});
    events.get(async (error, log) => {
      if (error) {
        assert.equal(error, null, error.toString());
      }

      try {
        await indexingUtil.indexEvents(log);
      } catch (err) {
        assert.equal(err, null, err.toString());
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    events = eventBase.Updated({}, {fromBlock: 0});

    events.watch(async (error, response) => {
      if (error) {
        assert.equal(error, null, error.toString());
      }

      try {
        await indexingUtil.updateEvents([response]);
      } catch (err) {
        assert.equal(err, null, err.toString());
      }
    });


    await token.transferToContract(
      event.address,
      98765,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    );

    await token.transferToContract(
      event.address,
      43210,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[1]}
    );

    await new Promise((resolve) => setTimeout(resolve, 6000));
    events.stopWatching();

    let eventsResult = await esClient.search(Object.assign({
      index: EVENT_INDEX,
      _source_exclude: ['bettor'],
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  'bettor': accounts[1],
                }
              }
            ],
          }
        }
      }
    })).catch((error) => {
      assert.equal(error, null, error.toString());
    });

    logger.trace(eventsResult);

    assert.equal(eventsResult.hits.total, 1, 'Invalid hits count');
    assert.equal(eventsResult.hits.hits[0]._id, event.address, 'Invalid event found');

    let bidsResult = await esClient.search(Object.assign({
      index: BET_INDEX,
      sort: `timestamp:asc`,
      body: {
        query: {
          bool: {
            must: [
              {
                terms: {
                  'event': eventsResult.hits.hits.map((hit) => hit._id),
                }
              }
            ]
          }
        }
      }
    }));

    assert.equal(bidsResult.hits.hits.length, 2, 'Invalid bets count');
    assert.equal(bidsResult.hits.hits[0]._source.bettor, accounts[0], 'Invalid bet');
    assert.equal(bidsResult.hits.hits[0]._source.amount, 98765, 'Invalid bet');
    assert.equal(bidsResult.hits.hits[1]._source.bettor, accounts[1], 'Invalid bet');
    assert.equal(bidsResult.hits.hits[1]._source.amount, 43210, 'Invalid bet');
  });
});
