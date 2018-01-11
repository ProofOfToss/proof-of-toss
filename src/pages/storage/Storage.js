import React, { Component } from 'react'
import SimpleStorageContract from '../../../build/contracts/SimpleStorage.json'
import getWeb3 from '../../util/getWeb3'

import './Storage.scss'

class Storage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      localValue: 0,
      web3: null
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.simpleStorageInstance = null;
    this.accounts = [];
  }

  handleChange(event) {
    this.setState({localValue: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.simpleStorageInstance.set(this.state.localValue, {from: this.accounts[0]}).then((result) => {
      // Get the value from the contract to prove it worked.
      return this.simpleStorageInstance.get.call(this.accounts[0])
    }).then((result) => {
      // Update state with the result.
      return this.setState({ storageValue: result.c[0] })
    })
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.accounts = accounts;

      simpleStorage.deployed().then((instance) => {
        this.simpleStorageInstance = simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  render() {
    return (
      <main className="container">
        <div>
          <h1>Good to Go!</h1>
          <p>Your Truffle Box is installed and ready.</p>
          <h2>Smart Contract Example</h2>
          <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
          <p>Try changing the value stored on <strong>line 59</strong> of Storage.js.</p>
          <p>The stored value is: {this.state.storageValue}</p>

          <form onSubmit={this.handleSubmit}>
            <label>
              New value:
              <input type="text" value={this.state.value} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </main>
    );
  }
}

export default Storage
