# Architecture

* Solidity smart-contracts
    - developed using truffle [truffle 4.x](http://truffleframework.com/) [solc 0.4.x](http://solidity.readthedocs.io)
    - public MVP will be deployed to Ethereum blockchain. Product is planned to work on RSK blockchain
    - store data in compressed cost-effective format
* Elasticsearch index
    - stores data from blockchain in a suitable format for effective filtration and sorting
* Web-app
    - developed with react and redux [reactjs](https://reactjs.org/) [redux](https://redux.js.org/)
    - using web3 for interaction with smart-contracts
    - loads data from elasticsearch [elasticsearch-js](https://github.com/elastic/elasticsearch-js)
* Data indexer
    - developed on [node.js](https://nodejs.org)
    - listens for blockchain events, fetching data from blockchain and sends it to elasticsearch

# Project structure

```
build – truffle artifacts directory
build_webpack – built web-app
config – build configuration
contracts – smart contracts dir
    ./ - project contracts
    installed_contracts – third party contracts
    test – contracts used in unit tests
    token-sale-contracts – TOSS Token smart contracts (git submodule https://github.com/ProofOfToss/token-sale-contracts)
docker
    rsk – docker config for RSK node
    app – docker config for app node (app watching blockchain events and indexing them to elasticsearch)
migrations – truffle migrations
public – web-app entry point
scripts 
    app.js – app watching blockchain events and indexing them to elasticsearch
    build.js – build web-app with webpack
    create_es_index.js – creates elasticsearch indeces for events and bets
    start.js – starts dev server
    sync_whitelist.js – uploads list of privileged users to blockchain
src
    App.js – web-app common layout (header, footer)
    index.js – entry point, redux initialization
    
    reducer.js – redux root reducer
    store.js – redux store
    actions – redux actions dir
    reducers – redux sub-reducers
    
    data – app configuration
    util – reusable logic
    components, pages – react components
test – unit tests
```

# Smart contracts

## Token

ERC20 token inheriting FreezingToken, MintableToken, MigratableToken, BurnableToken contracts from open-zeppelin lib.
Token has app-specific logic: 

- token blocking. Methods blockTokens, unblockTokens, allowBlocking, grantToAllowBlocking are needed for operator's pledge logic
- ERC223-like token transfer with additional data (transferToContract). When send tokens with transferToContract receiving contract must implement tokenFallback method. We do not implement ERC223 fully because the token needs to be compatible with existing smart-contracts using ERC20 standard and not implementing tokenFallback method.

## Whitelist

Whitelist contract stores list of privileged wallets from which is allowed to create and resolve events. Used in Main and EventBase contracts respectively.

## Main

Creates new events.

## EventBase

All event logic (bets, results resolving, prize withdrawal) is implemented here

## Event

Event smart contract creates for each event and serves as a blockchain data store for those events.
To minimize gas usage Event smart contract contains no logic. All method calls are proxied to EventBase instance with delegatecall opcode.


# How to install

TOSS Token smart contracts are hosting in a separate repository (https://github.com/ProofOfToss/token-sale-contracts) and linked to contracts/token-sale-contracts via git submodule system.
To initialize submodules run:
```
$ git submodule init
$ git submodule update 
```

This project use [solc (Solidity compiler)](http://solidity.readthedocs.io/en/develop/installing-solidity.html) and 
[truffle framework](https://github.com/trufflesuite/truffle).

To install them execute:
```
$ npm install -g solc truffle@4 babel-cli
```

Project also required connection to [rsk blockchain](http://www.rsk.co/). For development it is possible to use [testrpc](https://github.com/trufflesuite/ganache-cli):
```
$ npm install -g ganache-cli
```

1. After that go to the project root directory and install dependencies:
    ```
    $ npm install
    ```
    
1. Copy `truffle.js.example` to `truffle.js`

1. Copy `src/data/config.json.dist` to `src/data/config.json`

1. Compile and deploy contracts:
    ```
    $ truffle compile
    $ truffle --network test migrate
    ```

1. Launch server:
    ```
    $ npm run start
    ```
    
1. For accessing admin pages account must be whitelisted. Whitelist is located at src/data/config.json
To synchronize white list with blockchain run:
    ```
    $ npm run sync-whitelist
    ```
    It should be executed after each deploy.

1. TOSS Token is paused by default. To get site working the Main smart contract should be unpaused and granted to unpause other contracts.
There is a sample script [ scripts/prepare_demo_token.js ] to do this task. 
    ```
    $ babel-node scripts/prepare_demo_token.js
    ```
    Run it after each deploy. 
    
After that open `localhost:3000` in a browser

# Metamask

It is necessary to use metamask browser extension to work with a wallet. It is possible to use 
[original metamask](https://metamask.io/), but there are few problems with it:
* Invalid currency name. Should be SBTC
* Invalid exchange rate

This problems solved in [our fork](https://github.com/ProofOfToss/metamask-rsk) of the original metamask.

# Elastic search

We are using [elastic search](https://www.elastic.co/products/elasticsearch) to store some information in it.
It is necessary to install [babel cli](http://babeljs.io/docs/usage/cli/) before.
Then execute this command to launch this script:
```
$ ./node_modules/babel-cli/bin/babel-node.js scripts/app.js
```
This script will handle blockchain events and save them in [elastic search](https://www.elastic.co/products/elasticsearch)
 

# How to execute tests in testrpc blockchain

#### Solidity contracts tests
```
$ truffle --network test test
```

#### Frontend tests
```
$ npm run test
```

# How to build frontend
To create `html` and `js` files execute:
```
$ npm run build
```
After that files will be in the `./build_webpack` folder.
