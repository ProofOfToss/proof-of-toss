import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

import { modalResolveShow } from "../../../actions/pages/event";

import BasePage from '../BasePage';
import { fetchEvent } from '../../../actions/pages/event';
import CategoryUtil from '../../../util/CategoryUtil';
import MainInfo from '../../../components/event/MainInfo';
import TagsList from '../../../components/event/TagsList';
import ResultsList from '../../../components/admin/event/ResultsList';

class Index extends Component {
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
        <h1>Admin event page</h1>
        <MainInfo eventData={this.props.eventData} />
        <TagsList tags={this.props.eventData.tag} />
        <ResultsList status={this.props.eventData.status}
                     resolvedResult={this.props.eventData.resolvedResult}
                     results={this.props.eventData.possibleResults} />
      </Fragment>
    )
  }

  render() {
    if(!this.props.fetched) {
      return <div className='alert alert-info' role='alert'>
        {this.props.translate('pages.event.fetching')}
      </div>;
    }

    const content =
      <main className="container event">
        {this.renderEvent()}
      </main>;

    return(
      <BasePage content={content} />
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
  modalResolveShow
};

export default connect(mapStateToProps, mapDispatchToProps)(Index)
