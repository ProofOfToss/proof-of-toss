import 'babel-polyfill';
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Index from '../play/Index';

class EventResults extends Component {

  renderEventResults() {
    return (<Index
      header="pages.event_results.header"
      routeName="admin/event_results"
      refreshInterval="5000"
      includeEndDateColumn="true"
      freeDateInterval={true}
      defaultSortField="endDate"
      defaultSortOrder="asc"
      location={this.props.location}
    />);
  }

  renderAccessDenied() {
    return (<main className="container">
      <div>
        <div className="pure-u-1-1">
          <h1>{this.props.translate('pages.event_results.header')}</h1>
          <div>
            <p>{this.props.translate('access_denied')}</p>
          </div>
        </div>
      </div>
    </main>);
  }

  render() {
    return (this.props.isWhitelisted ? this.renderEventResults() : this.renderAccessDenied());
  }
}

function mapPropsToState(state) {
  return {
    translate: getTranslate(state.locale),
    isWhitelisted: state.user.isWhitelisted
  };
}

export default connect(mapPropsToState)(EventResults);

