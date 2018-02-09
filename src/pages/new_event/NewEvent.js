import React, { Component } from 'react'
import { connect } from 'react-redux';
import EventForm from '../../components/event/EventForm';
import MainContract from '../../../build/contracts/Main.json'
import TokenContract from '../../../build/contracts/Token.json'

class NewEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventAddress: null,
      web3: null,
      mainInstance: null,
      tokenInstance: null
    }
  }

  render() {
    return (
      <main className="container">
        <div>
          {
            this.state.eventAddress === null && <div className="pure-u-1-1">{}
              <h1>New event</h1>
              <EventForm ref={ev => this.event = ev} />
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

function mapPropsToState(state) {
  return {
    web3: state.web3.web3
  };
}

export default connect(mapPropsToState)(NewEvent);
