import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import { fetchEvent, resetEvent } from '../../actions/pages/event';

export class Event extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showErrors: false,
      showConfirmModal: false
    }
  }

  render() {
    return(
      <main className="container event">
        <p>{this.props.translate('pages.event.fetching')}</p>
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
    fetched: state.event.fetched,
    eventData: state.event.eventData
  };
}

const mapDispatchToProps = {
  fetchEvent,
  resetEvent
};

export default connect(mapStateToProps, mapDispatchToProps)(Event)
