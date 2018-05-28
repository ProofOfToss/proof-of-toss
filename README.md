# Architecture

* Solidity smart-contracts
    - developed using truffle [truffle 4.x](http://truffleframework.com/), [solc >= 0.4.22](http://solidity.readthedocs.io)
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

Clone this repository:
```
$ git clone https://github.com/ProofOfToss/proof-of-toss.git proof-of-toss
```

TOSS Token smart contracts are hosting in a separate repository (https://github.com/ProofOfToss/token-sale-contracts) and linked to contracts/token-sale-contracts via git submodule system.
To initialize submodules run in the project folder:
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

1. Launch `ganache-cli`:
    ```
    $ ganache-cli
    ```
    You should see something like this:
    ```
    Ganache CLI v6.0.3 (ganache-core: 2.0.2)
    
    Available Accounts
    ==================
    (0) 0xcf917a1f7b9b71aa3e3046ec6969e4b210179521
    (1) 0x369d6ef29adc68d4999e98edc07ecd65563d0945
    (2) 0xec0705eb54789adf51627b8f0331bc657882eae8
    (3) 0xaf1b1e1524d573eba5dae315c4e4972596b3de23
    
    Private Keys
    ==================
    (0) da8790fd91894aac54f122810c7e940689eba4248eb82f672d69527451b13ef6
    (1) 0272b60d17adb4d0df63b011b9d4fa6fbb6728f14e300807935002dff9b3fd35
    (2) 08f2311c2b5dfd63e1486c400b8f43c1f50cd6d64d3d7d0a4dbf87b92c5cbc4e
    (3) 0e785b00dde0d36b79c6e0003d3b44dbb88a29fe835b10217ab690a066988197
    ```
    
    By default `ganache-cli` creates 10 accounts. It is possible to use `--account` option to use specific addresses.
    If you will do this create at least 4 accounts. It is necessary for contracts tests.
    
1. Install metamask extension in a browser and import first private key from the previous step

1. Compile and deploy contracts:
    ```
    $ truffle compile
    $ truffle --network test migrate
    ```

1. Launch server:
    ```
    $ npm run start
    ```
    
1. For accessing admin pages account must be whitelisted. Whitelist is located at `src/data/config.json`
Add address from 4 step to the `whitelist` key.
To synchronize white list with blockchain run:
    ```
    $ npm run sync_whitelist
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
