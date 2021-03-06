import 'babel-polyfill';
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import EventForm from '../../components/new_event/EventForm';
import { formatBalance } from './../../util/token';

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
              <h1>{this.props.translate('pages.new_event.header')}</h1>
              {
                this.props.isWhitelisted
                  ? (
                    formatBalance(this.props.balance) >= 1
                      ? <EventForm ref={ev => this.event = ev} />
                      : <div>
                        <p>{this.props.translate('pages.new_event.low_balance')}</p>
                      </div>
                  )
                  : <div>
                      <p>{this.props.translate('access_denied')}</p>
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
    balance: state.token.balance,
  };
}

export default connect(mapPropsToState)(NewEvent)

