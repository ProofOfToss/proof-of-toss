import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import { fetchEvent, resetEvent } from '../../actions/pages/event';

import MainInfo from '../../components/event/MainInfo';
import TagsList from '../../components/event/TagsList';
import ResultsList from '../../components/event/ResultsList';

class Event extends Component {
  componentWillMount() {
    this.props.fetchEvent(this.props.params.id);
  }

  componentDidMount() {
    this.updateEventTimer = setInterval(() => {
      this.props.fetchEvent(this.props.params.id);
    }, 1000 * 10);
  }

  componentWillUnmount() {
    clearInterval(this.updateEventTimer);
    this.props.resetEvent();
  }

  renderEvent() {
    return( <Fragment>
        <MainInfo eventData={this.props.eventData} />
        <TagsList tags={this.props.eventData.tag} />
        <ResultsList status={this.props.eventData.status}
                     resolvedResult={this.props.eventData.resolvedResult}
                     startTime={this.props.eventData.startDate}
                     results={this.props.eventData.possibleResults}
        />
      </Fragment>
    )
  }

  render() {
    if(!this.props.fetched) {
      return <main className="container event">
        <div className='alert alert-info' role='alert'>
          {this.props.translate('pages.event.fetching')}
        </div>
      </main>;
    }

    return(
      <main className="container event">
        {this.renderEvent()}
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
