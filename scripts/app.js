// Import libraries we need.
var fs = require('fs');
var Web3 = require('web3');
var contract = require('truffle-contract');
var Config = require("truffle-config");
var Resolver = require("truffle-resolver");

module.exports = function(callback) {
  var config = Config.detect({'network': 'test'});
  var resolver = new Resolver(config);
  var provider = config.provider;

  // Import our contract artifacts and turn them into usable abstractions.
  // var token_artifacts = require('../build/contracts/Token.json');
  // var main_artifacts = require('../build/contracts/Main.json');
  // var event_artifacts = require('../build/contracts/Event.json');
  // var Token = contract(token_artifacts);
  // var Main = contract(main_artifacts);
  // var Event = contract(event_artifacts);
  // Это НЕ РАБОТАЕТ – дичайшие глюки

  var Main = resolver.require("../contracts/Main.sol");
  var Event = resolver.require("../contracts/Event.sol");
  var Token = resolver.require("../contracts/Token.sol");

  var web3 = new Web3();
  web3.setProvider(provider);

  Token.setProvider(provider);
  Main.setProvider(provider);
  Event.setProvider(provider);
  Token.defaults({from: web3.eth.coinbase});
  Main.defaults({from: web3.eth.coinbase});
  Event.defaults({from: web3.eth.coinbase});

  web3.eth.defaultAccount = web3.eth.coinbase;

  var main, token, event, accounts;

  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;

    // runTest(); // uncomment to create some events
    getEvents();
  });

  function getEvents() {
    var main;
    var cachedEventsFile = './cachedEvents.json';
    var cachedEvents = [], cacheConsistent = false;

    if (fs.existsSync(cachedEventsFile)) {
      try {
        cachedEvents = JSON.parse(fs.readFileSync(cachedEventsFile, {encoding: "utf8"}));
      } catch (e) {
        console.log(e);
      }
    };

    Main.deployed().then(function (instance) {

      main = instance;

      // return main.allEvents({fromBlock: 0, toBlock: 'latest'});
      return main.NewEvent({}, {fromBlock: 0, toBlock: 'latest'});

    }).then(function (events) {
      
      console.log(events);

      events.get(function (error, log) {
        if (!error) {
          // console.log(log);

          if(cachedEvents.length == log.length) {
            cacheConsistent = true;
          } else {
            cachedEvents = [];
            log.forEach(function (event) {
              cachedEvents.push(event.args);
            });
            fs.writeFileSync(cachedEventsFile, JSON.stringify(cachedEvents) + '\n');
          }

          if(cacheConsistent) {
            console.log('Loaded cached data');
          } else {
            console.log('Cache updated');
          }

          cachedEvents.forEach(function (event) {
            console.log(event);
          });
        } else {
          console.log(error);
        }
      });

      //callback();
      //process.exit();

    });
  }

  function runTest() {
    Token.deployed().then(function (instance) {

      token = instance;

      return Main.deployed();

    }).then(function (instance) {

      main = instance;

      main.NewEvent().watch(function(error, result){
        console.log('AAAAAAA');
        if (!error) {
          console.log(result);
        } else {
          console.log(error);
        }
      });

      return token.transfer(accounts[1], 10000, {from: accounts[0]});

    }).then(function (instance) {

      return main.getToken();

    }).then(function(tokenAddress) {

      console.log(`tokenSC address: ${tokenAddress} ${token.address}`);

      return token.approve(main.address, 1000, {from: accounts[1]});

    }).then(function () {

      console.log(`mainSC address: ${main.address}`);

      return main.newEvent(1000, {from: accounts[1]});

    }).then(function () {

      return main.getLastEvent({from: accounts[1]});

    }).then(function (eventAddress) {

      console.log(`event address: ${eventAddress}`);

      event = Event.at(eventAddress);

      return event.getCreatedTimestamp({from: accounts[1]});

    }).then(function (timestamp) {

      console.log(`timestamp: ${timestamp.toNumber()}`);

    }).then(function () {

      return token.balanceOf(event.address, {from: accounts[1]});

    }).then(function (balance) {

      console.log(`event balance: ${balance}`);

    }).then(function () {

      return main.allEvents();

    }).then(function (events) {

      events.get(function (error, log) {
        if (!error)
          console.log(log);
        else
          console.log(error);
      });

      //callback();
      //process.exit();

    }).catch(function (e) {

      console.log(e);

      callback();
      process.exit();

    });
  }
}
