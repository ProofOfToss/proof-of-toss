import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import { fetchEvent } from '../../util/event';

import ResultsList from '../../components/event/ResultsList';

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventInstance: null
    };
  }

  componentWillMount() {
    this.setState({
      eventInstance: fetchEvent(this.props.web3, this.props.params.id)
    })
  }

  renderEvent() {
    return( <Fragment>
        <dl className="dl-horizontal">
          <dt>Event</dt>
          <dd>{this.props.params.id}</dd>
        </dl>
        <ResultsList eventInstance={this.state.eventInstance}/>
      </Fragment>
    )
  }

  render() {
    let content = <div className='alert alert-info' role='alert'>
      {this.props.translate('pages.event.fetching')}
    </div>;

    if(this.state.eventInstance) {
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
  };
}

export default connect(mapStateToProps)(Event)
