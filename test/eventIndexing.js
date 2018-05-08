import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';
import {toBytesTruffle as toBytes} from '../src/util/serialityUtil';
import {AwsEsPublicClient} from '../src/util/esClient';
import {IndexingUtil} from '../src/util/indexingUtil';
import appConfig from '../src/data/config.json';
import log4js from 'log4js';
import _ from 'lodash';
import { decodeEvent } from '../src/util/web3Util';

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

    main = await Main.deployed();
    await token.approve(main.address, 10000000, {from: accounts[0]});
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

  /*it("should index bets", async () => {
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

    await new Promise((resolve) => setTimeout(resolve, 6000));


    let transactionResult = await token.transferToContract(
      event.address,
      98765,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[0]}
    );

    console.log(transactionResult.receipt.logs);
    let log = decodeEvent(Main.web3, transactionResult.receipt.logs, eventBase, 'Updated');

    try {
      await indexingUtil.updateEvents([log]);
    } catch (err) {
      assert.equal(err, null, err.toString());
    }

    transactionResult = await token.transferToContract(
      event.address,
      43210,
      toBytes(
        {type: 'uint', size: 8, value: 1}, // action – bet
        {type: 'uint', size: 8, value: 0}, // result index
      ),
      {from: accounts[1]}
    );

    console.log(transactionResult.receipt.logs);
    log = decodeEvent(Main.web3, transactionResult.receipt.logs, eventBase, 'Updated');

    try {
      await indexingUtil.updateEvents([log]);
    } catch (err) {
      assert.equal(err, null, err.toString());
    }

    await new Promise((resolve) => setTimeout(resolve, 6000));

    let eventsResult = await esClient.search(Object.assign({
      index: EVENT_INDEX,
      //_source_exclude: ['bettor'],
      body: {
        /!*query: {
          bool: {
            must: [
              {
                term: {
                  'bettor': accounts[1],
                }
              }
            ],
          }
        }*!/
      }
    })).catch((error) => {
      assert.equal(error, null, error.toString());
    });

    console.log(_.map(eventsResult.hits.hits, '_source'));

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
  });*/

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

    console.log(_.map(eventsResult.hits.hits, '_source'));

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
