import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import moment from 'moment';
import CategoryUtil from '../../util/CategoryUtil';
import SourceUrl from './SourceUrl';

class MainInfo extends Component {

  constructor(props) {
    super(props);
    this.categoryUtil = new CategoryUtil(props.translate);
  }

  render() {
    return <div className="event__main-info">
      <dl className="dl-horizontal">
        <dt>{this.props.translate('pages.event.labels.name')}</dt>
        <dd>{this.props.eventData.name}</dd>
      </dl>
      <dl className="dl-horizontal">
        <dt>{this.props.translate('pages.event.labels.state')}</dt>
        <dd>{this.props.translate(`pages.event.states.state_${this.props.eventData.status}`)}</dd>
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
      <SourceUrl sourceUrl={this.props.eventData.sourceUrl} />
      {this.props.eventData.status > 5 &&
        <dl className="dl-horizontal">
          <dt>{this.props.translate('pages.event.labels.resolved_result')}</dt>
          <dd>{this.props.eventData.resolvedResultDescription}</dd>
        </dl>
      }
    </div>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  }
}

export default connect(mapStateToProps)(MainInfo);