import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import EventForm from '../../components/event/EventForm';
import config from "../../data/config.json";

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
            this.state.eventAddress === null && <div className="pure-u-1-1">
              <h1>New event</h1>
              {
                config.whitelist.indexOf(this.props.currentAddress) >= 0
                  ? <EventForm ref={ev => this.event = ev} />
                  : <p>{this.props.translate('pages.new_event.access_denied')}</p>
              }
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
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
  };
}

export default connect(mapPropsToState)(NewEvent)

