import React, { Component } from 'react'
import EventForm from '../../components/event/EventForm';

class NewEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventAddress: null
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

export default NewEvent;
