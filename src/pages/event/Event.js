import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import moment from 'moment';
import { getTranslate } from 'react-localize-redux';
import { fetchEvent } from '../../actions/pages/event';

import ResultsList from '../../components/event/ResultsList';

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventInstance: null
    };
  }

  componentWillMount() {
    this.props.fetchEvent(this.props.params.id);
  }

  renderEvent() {
    return( <Fragment>
        <dl className="dl-horizontal">
          <dt>Event</dt>
          <dd>{this.props.params.id}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>End date</dt>
          <dd>{moment(this.props.eventData.endDate).format('LLL')}</dd>
        </dl>
        <ResultsList eventInstance={this.props.eventInstance}/>
      </Fragment>
    )
  }

  render() {
    let content = <div className='alert alert-info' role='alert'>
      {this.props.translate('pages.event.fetching')}
    </div>;

    if(this.props.eventInstance) {
      content = this.renderEvent();
    }

    return(
      <main className="container event">
        {content}
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
    eventInstance: state.event.eventInstance,
    eventData: state.event.eventData
  };
}

const mapDispatchToProps = {
  fetchEvent
};

export default connect(mapStateToProps, mapDispatchToProps)(Event)
