import expectThrow from './helpers/expectThrow';
import { serializeEvent } from '../src/util/eventUtil';

var Main = artifacts.require("./Main.sol");
var EventBase = artifacts.require("./EventBase.sol");
var Token = artifacts.require("./token-sale-contracts/TokenSale/Token/Token.sol");
var Whitelist = artifacts.require("./Whitelist.sol");

contract('Main', function(accounts) {

  const eventName = 'Test event';
  const eventDeposit = 10000000;
  const eventDescription = 'description';

  const bidType = 'bid_type';
  const eventCategory = 'category_id';
  const eventLocale = 'en';

  const now = Math.floor((new Date()).getTime() / 1000);
  const eventStartDate = now - 24 * 3600;
  const eventEndDate = now - 22 * 3600;

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

  it("should not allow to update EventBase to non owner of Main contract", async function() {
    const main = await Main.deployed();
    const eventBase = await EventBase.deployed();

    await expectThrow(
      main.updateEventBase(eventBase.address, {from: accounts[1]})
    );
  });

  it("should update EventBase", async function() {
    const token = await Token.deployed();
    const main = await Main.deployed();
    const whitelist = await Whitelist.deployed();

    const newEventBase = await EventBase.new(token.address, {gas: 45000000});
    await main.updateEventBase(newEventBase.address, {from: accounts[0]});
    const newEventBaseAddress = await main.eventBase();

    assert.equal(newEventBaseAddress, newEventBase.address, "Addresses of EventBase are not equal.");

    try {
      await whitelist.updateWhitelist(accounts[0], true);

      eventData.name = 'Test event 4';

      const transactionResult = await token.transferToContract(
        main.address,
        eventDeposit,
        serializeEvent(eventData),
        {from: accounts[0]}
      );

      const events = await new Promise((resolve, reject) => {
        main.NewEvent(
          {},
          {
            fromBlock: transactionResult.receipt.blockNumber,
            toBlock: 'pending',
            topics: transactionResult.receipt.logs[0].topics
          }
        ).get((error, log) => {
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
