import React, { Component } from 'react'
import getWeb3 from '../../util/getWeb3'
import EventContract from '../../../build/contracts/Event.json'

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = { id: this.props.params.id, web3: null, timestamp: null, creator: null };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ id: nextProps.params.id })
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        const contract = require('truffle-contract');
        const _event = contract(EventContract);
        _event.setProvider(this.state.web3.currentProvider);

        var eventInstance = _event.at(this.state.id);

        eventInstance.getCreatedTimestamp().then((timestamp) => {
          this.setState({
            timestamp: timestamp.toNumber()
          });
        });

        eventInstance.getCreator().then((creator) => {
          this.setState({
            creator: creator
          });
        });
      })
      .catch((e) => {
        console.log('Error finding web3.', e)
      })
  }

  render() {
    return(
      <div>
        <p>Event: {this.state.id}</p>
        <p>Created at: {this.state.timestamp}</p>
        <p>Created by: {this.state.creator}</p>
      </div>
    )
  }
}

export default Event
