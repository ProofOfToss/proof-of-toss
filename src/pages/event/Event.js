import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import moment from 'moment';
import { getTranslate } from 'react-localize-redux';
import { fetchEvent } from '../../actions/pages/event';

import CategoryUtil from '../../util/CategoryUtil';
import TagsList from '../../components/event/TagsList';
import ResultsList from '../../components/event/ResultsList';

class Event extends Component {
  constructor(props) {
    super(props);

    this.categoryUtil = new CategoryUtil(this.props.translate);
  }

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
  }

  renderEvent() {
    return( <Fragment>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.name')}</dt>
          <dd>{this.props.eventData.name}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.bid_type')}</dt>
          <dd>{this.props.eventData.bidType}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.category')}</dt>
          <dd>{this.categoryUtil.getName(this.props.eventData.category)}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.start_time')}</dt>
          <dd>{moment.unix(this.props.eventData.startDate).format('LLL')}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.end_time')}</dt>
          <dd>{moment.unix(this.props.eventData.endDate).format('LLL')}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.description')}</dt>
          <dd>{this.props.eventData.description}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.source_url')}</dt>
          <dd>{this.props.eventData.sourceUrl}</dd>
        </dl>
        <TagsList tags={this.props.eventData.tag} />
        <ResultsList status={this.props.eventData.status} endTime={this.props.eventData.endDate}
                     results={this.props.eventData.possibleResults} />
      </Fragment>
    )
  }

  render() {
    let content = <div className='alert alert-info' role='alert'>
      {this.props.translate('pages.event.fetching')}
    </div>;

    if(this.props.fetched) {
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
    fetched: state.event.fetched,
    eventData: state.event.eventData
  };
}

const mapDispatchToProps = {
  fetchEvent
};

export default connect(mapStateToProps, mapDispatchToProps)(Event)
