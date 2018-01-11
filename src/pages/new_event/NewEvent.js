import React, { Component } from 'react'
import EventForm from '../../components/event/EventForm';
import MainContract from '../../../build/contracts/Main.json'
import TokenContract from '../../../build/contracts/Token.json'
import getWeb3 from '../../util/getWeb3'

class NewEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventAddress: null,
      web3: null,
      mainInstance: null,
      tokenInstance: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  handleSubmit(e) {
    e.preventDefault();

    console.log(this.event);
    console.log(this.event.state);

    const contract = require('truffle-contract');
    const main = contract(MainContract);
    const token = contract(TokenContract);
    main.setProvider(this.state.web3.currentProvider);
    token.setProvider(this.state.web3.currentProvider);

    var self = this;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      self.accounts = accounts;

      main.deployed().then((instance) => {

        self.setState({mainInstance: instance});

        return token.deployed();

      }).then((instance) => {

        self.setState({tokenInstance: instance});
        console.log(self.state.mainInstance.address);

        return self.state.tokenInstance.approve(self.state.mainInstance.address, self.event.state.deposit, {from: accounts[0]});

      }).then(function() {

        return self.state.mainInstance.newEvent(self.event.state.deposit, self.event.state.name, {from: accounts[0]});

      }).then(function () {

        return self.state.mainInstance.getLastEvent({from: accounts[0]});

      }).then((eventAddress) => {

        self.setState({eventAddress: eventAddress});

      });
    })
  }

  render() {
    return (
      <main className="container">
        <div>
          {
            this.state.eventAddress === null && <div className="pure-u-1-1">{}
              <h1>New event</h1>
              <EventForm ref={ev => this.event = ev} onSubmit={this.handleSubmit} />
            </div>
          }
          {
            this.state.eventAddress !== null && this.state.eventAddress
          }
        </div>
      </main>
    );
  }
}

export default NewEvent
