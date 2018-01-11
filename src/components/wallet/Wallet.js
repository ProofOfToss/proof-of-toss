import React, { Component } from 'react'
import getWeb3 from '../../util/getWeb3'
import TokenContract from '../../../build/contracts/Token.json'

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = { web3: null, balance: null, tokenInstance: null };
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    var self = this;

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        const contract = require('truffle-contract');
        const token = contract(TokenContract);
        token.setProvider(this.state.web3.currentProvider);

        token.deployed().then((instance) => {
          self.setState({tokenInstance: instance});

          return self.state.tokenInstance.balanceOf(self.state.web3.eth.coinbase);
        }).then((balance) => {
          console.log(balance,self.state.web3.eth.coinbase);
          self.setState({balance: balance.c});
        });
      })
      .catch((e) => {
        console.log('Error finding web3.', e)
      })
  }

  render() {
    return(
      <span>{this.state.balance !== null ? <span>Balance: {this.state.balance} TOSS</span> : ''}</span>
    )
  }
}

export default Wallet
