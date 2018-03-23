import 'babel-polyfill';
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class EventResults extends Component {

  render() {
    return (
      <main className="container">
        <div>
            <div className="pure-u-1-1">
              <h1>Event results</h1>
              {
                this.props.isWhitelisted
                  ? <div><p>TODO</p></div>
                  : <div>
                      <p>{this.props.translate('access_denied')}</p>
                  </div>
              }
            </div>
        </div>
      </main>
    );
  }
}

function mapPropsToState(state) {
  return {
    translate: getTranslate(state.locale),
    isWhitelisted: state.user.isWhitelisted
  };
}

export default connect(mapPropsToState)(EventResults);

