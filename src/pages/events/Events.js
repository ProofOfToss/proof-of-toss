import React, { Component } from 'react'
import MainContract from '../../../build/contracts/Main.json'
import getWeb3 from '../../util/getWeb3'
import { Link } from 'react-router'

class Events extends Component {
  constructor(props) {
    super(props)

    this.state = {
      events: [],
      web3: null,
      mainInstance: null
    }
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
        this.getEvents()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  getEvents() {
    const contract = require('truffle-contract')
    const main = contract(MainContract)
    main.setProvider(this.state.web3.currentProvider)

    var self = this;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.accounts = accounts;

      main.deployed().then((instance) => {
        self.setState({mainInstance: instance});

        return self.state.mainInstance.NewEvent({}, {fromBlock: 0, toBlock: 'latest'});
      }).then((events) => {
        events.get(function (error, log) {
          console.log(error, log);
          if (!error) {
            return self.setState({ events: log })
          } else {
            console.log(error);
          }
        });
      });
    })
  }

  _renderEvents() {
    var elements = [];
    for(var i = 0; i < this.state.events.length; i++) {
      var event = this.state.events[i];
      elements.push(<div className='well' key={event['transactionHash']}>
        <p>Name: {event.args['eventName']}</p>
        <p>Timestamp: {event.args['createdTimestamp'].c}</p>
        <p>Address: {event.args['eventAddress']}</p>
        <p>Creator: {event.args['eventCreator']}</p>
        <p><Link to={'/event/' + event.args['eventAddress']}>more</Link></p>
      </div>);
    }

    return elements;
  }

  render() {
    return(
      <div>{this._renderEvents()}</div>
    )
  }
}

export default Events
