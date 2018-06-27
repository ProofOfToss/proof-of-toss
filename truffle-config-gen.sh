#!/bin/bash

cat ./truffle.js.example | sed s/PRIVATE_KEY_1/"$PRIVATE_KEY_1"/ | sed s/PRIVATE_KEY_2/"$PRIVATE_KEY_2"/ | sed s/PRIVATE_KEY_3/"$PRIVATE_KEY_3"/ | sed s/PRIVATE_KEY_4/"$PRIVATE_KEY_4"/ | sed s/PRIVATE_KEY_5/"$PRIVATE_KEY_5"/ | sed s/ROPSTEN_MNEMONIC/"$ROPSTEN_MNEMONIC"/ | sed s/ROPSTEN_INFURA_ID/"$ROPSTEN_INFURA_ID"/ > ./truffle.js
