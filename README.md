# Technologies

* [node.js](https://nodejs.org)
* [babel-cli](https://babeljs.io/docs/usage/cli/)
* [truffle 4.x](http://truffleframework.com/)
* [solc 0.4.x](http://solidity.readthedocs.io)
* [reactjs](https://reactjs.org/)
* [redux](https://redux.js.org/)
* [elasticsearch-js](https://github.com/elastic/elasticsearch-js)

# How to install

This project use [solc (Solidity compiler)](http://solidity.readthedocs.io/en/develop/installing-solidity.html) and 
[truffle framework](https://github.com/trufflesuite/truffle).

To install them execute:
```
$ npm install -g solc truffle
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
