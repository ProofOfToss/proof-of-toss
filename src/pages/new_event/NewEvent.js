import 'babel-polyfill';
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import EventForm from '../../components/event/EventForm';

class NewEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventAddress: null
    };
  }

  render() {
    return (
      <main className="container">
        <div>
          {
            this.state.eventAddress === null && <div className="pure-u-1-1">
              <h1>New event</h1>
              {
                this.props.isWhitelisted
                  ? <EventForm ref={ev => this.event = ev} />
                  : <div>
                      <p>{this.props.translate('pages.new_event.access_denied')}</p>
                  </div>
              }
            </div>
          }
        </div>
      </main>
    );
  }
}

function mapPropsToState(state) {
  return {
    translate: getTranslate(state.locale),
    isWhitelisted: state.user.isWhitelisted,
  };
}

export default connect(mapPropsToState)(NewEvent)

