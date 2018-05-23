#!/bin/bash

cat ./truffle.js.example | sed s/ROPSTEN_MNEMONIC/"$ROPSTEN_MNEMONIC"/ | sed s/ROPSTEN_INFURA_ID/"$ROPSTEN_INFURA_ID"/ > ./truffle.js
