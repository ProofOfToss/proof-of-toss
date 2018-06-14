import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';
import {toBytesTruffle as toBytes} from '../src/util/serialityUtil';
import {AwsEsPublicClient} from '../src/util/esClient';
import {IndexingUtil} from '../src/util/indexingUtil';
import BigNumber from '../src/util/bignumber';
import appConfig from '../src/data/config.json';
import log4js from 'log4js';
import _ from 'lodash';
import { decodeEvent } from '../src/util/web3Util';
import { formatBalance, denormalizeBalance } from '../src/util/token'

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
  const eventDeposit = denormalizeBalance(10000000);
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
    await token.mint(accounts[0], eventDeposit);

    main = await Main.deployed();
    await token.grantToSetUnpausedWallet(main.address, true);

    try {
      await whitelist.updateWhitelist(accounts[0], true);
    } catch (e) {
      assert.isUndefined(e);
    }

    const transactionResult = await token.transferToContract(main.address, eventDeposit, bytes, {
      from: accounts[0]
    });

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

    event = EventBase.at(events[0].args.eventAddress);
  });

  it("should index bets", async () => {
    let balance = (await token.balanceOf(accounts[1])).toNumber();
    if (balance > 0) { await token.burn(accounts[1], balance); }
    await token.mint(accounts[0], denormalizeBalance(98765));
    await token.mint(accounts[1], denormalizeBalance(43210));

    assert.equal(new BigNumber(await token.balanceOf(event.address)).toString(), eventDeposit.toString(), 'Invalid event balance');
    assert.equal(new BigNumber(await event.deposit()).toString(), eventDeposit.toString(), 'Invalid event deposit');

    const eventCreatorBalance = await token.balanceOf(accounts[0]);

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

    await new Promise((resolve) => setTimeout(resolve, 12000));

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
      denormalizeBalance(98765),
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    );

    assert.equal((await token.balanceOf(accounts[0])).toString(), (new BigNumber(eventCreatorBalance.minus(denormalizeBalance(98765)))).toString(), '1st player balance is invalid');

    await token.transferToContract(
      event.address,
      denormalizeBalance(43210),
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 1}, // result index
      ),
      {from: accounts[1]}
    );

    assert.equal((await token.balanceOf(accounts[0])).toNumber(), 0, '2nd player balance is invalid');

    await new Promise((resolve) => setTimeout(resolve, 12000));

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

    console.log('eventsResult', _.map(eventsResult.hits.hits, '_source'));

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

    console.log('bidsResult', _.map(bidsResult.hits.hits, '_source'));

    assert.equal(bidsResult.hits.hits.length, 2, 'Invalid bets count');
    assert.equal(bidsResult.hits.hits[0]._source.bettor, accounts[0], 'Invalid bet');
    assert.equal(bidsResult.hits.hits[0]._source.amount, 98765, 'Invalid bet');
    assert.equal(bidsResult.hits.hits[1]._source.bettor, accounts[1], 'Invalid bet');
    assert.equal(bidsResult.hits.hits[1]._source.amount, 43210, 'Invalid bet');









    await event.setStartDate(now - 120);
    assert.equal(await event.getState(), 3, 'Event state must be Started');

    await event.setEndDate(now - 60);
    assert.equal(await event.getState(), 4, 'Event state must be Finished');

    const txResult = await event.resolve(1);
    assert.equal(await event.resolvedResult(), 1, 'Event result must be 1');
    assert.equal(await event.getState(), 5, 'Event state must be Closed');

    const betSums = await event.calculateBetsSums();

    assert.equal(new BigNumber(betSums[0]).toString(), denormalizeBalance(98765 + 43210).toString(), 'Invalid bets sum');
    assert.equal(new BigNumber(betSums[1]).toString(), denormalizeBalance(43210).toString(), 'Invalid winners bets sum');
    assert.equal(new BigNumber(betSums[2]).toString(), denormalizeBalance(98765).toString(), 'Invalid losers bets sum');

    assert.equal(new BigNumber(await event.getEventCreatorReward()).toString(), denormalizeBalance((98765 + 43210) * 0.01).plus(eventDeposit).toString(), 'Invalid EC reward');

    await expectThrow(event.withdrawPrize(0, {from: accounts[0]}));
    await event.withdrawPrize(0, {from: accounts[1]});
    await event.withdrawReward({from: accounts[0]});

    /*
    eventCreatorBalance
    98765000009999990000000
    10000000
    98765000000000000000000
    1419750000000000000000

    10000010000000
    1419750010000000000000


    eventCreatorBalance
    98765000000000000000000
    10000000000000000000000000
    98765000000000000000000
    1419750000000000000000

    3181795956718829568
    10001419750000000000000000

     */

    console.log('eventCreatorBalance', (new BigNumber(eventCreatorBalance)).toString());
    console.log('(await token.balanceOf(accounts[0])).toString()', (await token.balanceOf(accounts[0])).toString());
    console.log('new BigNumber(eventCreatorBalance.plus(eventDeposit).minus(denormalizeBalance(98765)).plus(denormalizeBalance((98765 + 43210) * 0.01))).toString()', new BigNumber(eventCreatorBalance.plus(eventDeposit).minus(denormalizeBalance(98765)).plus(denormalizeBalance((98765 + 43210) * 0.01))).toString());

    assert.equal(new BigNumber(await token.balanceOf(accounts[1])).toString(), denormalizeBalance(98765 * 0.99 + 43210 * 0.99).toString(), 'Winner balance is invalid');
    assert.equal(new BigNumber(await token.balanceOf(accounts[0])).toString(), new BigNumber(eventCreatorBalance.plus(eventDeposit).minus(denormalizeBalance(98765)).plus(denormalizeBalance((98765 + 43210) * 0.01))).toString(), 'EC balance is invalid');

    // assert.equal((await token.balanceOf(event.address)).toNumber(), 0, 'Event balance is invalid');

    await new Promise((resolve) => setTimeout(resolve, 12000));
    events.stopWatching();


    eventsResult = await esClient.search(Object.assign({
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

    console.log(_.map(eventsResult.hits.hits, '_source'));

    assert.equal(eventsResult.hits.total, 1, 'Invalid hits count');
    assert.equal(eventsResult.hits.hits[0]._id, event.address, 'Invalid event found');
    assert.equal(eventsResult.hits.hits[0]._source.withdrawn, true, 'Event must be withdrawn');

    bidsResult = await esClient.search(Object.assign({
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


    console.log(bidsResult.hits.hits);

    assert.equal(bidsResult.hits.hits.length, 2, 'Invalid bets count');
    assert.equal(bidsResult.hits.hits[0]._source.bettor, accounts[0], 'Invalid bet');
    assert.equal(bidsResult.hits.hits[0]._source.amount, 98765, 'Invalid bet');
    assert.equal(bidsResult.hits.hits[1]._source.bettor, accounts[1], 'Invalid bet');
    assert.equal(bidsResult.hits.hits[1]._source.amount, 43210, 'Invalid bet');

    assert.equal(bidsResult.hits.hits[0]._source.withdrawn, false, 'Bet 1 must not be withdrawn');
    assert.equal(bidsResult.hits.hits[1]._source.withdrawn, true, 'Bet 2 must be withdrawn');
  });
});
