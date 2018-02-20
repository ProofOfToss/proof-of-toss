# Technologies

- node.js
- babel-cli
- truffle 4.x
- solc 0.4.15

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

# How to install

This project use [solc (Solidity compiler)](http://solidity.readthedocs.io/en/develop/installing-solidity.html) and 
[truffle framework](https://github.com/trufflesuite/truffle).

To install them execute:
```
$ npm install -g solc truffle
```

Project also required connection to Ethereum blockchain. For development it is possible to use [testrpc](https://github.com/trufflesuite/ganache-cli):
```
$ npm install -g ganache-cli
```

1. After that go to the project root directory and install dependencies:
    ```
    $ npm install
    ```

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
