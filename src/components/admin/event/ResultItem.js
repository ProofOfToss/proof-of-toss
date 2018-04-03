import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

import { modalResolveShow } from '../../../actions/pages/event';
import { STATUS_FINISHED, STATUS_CLOSED } from "../../../util/eventUtil";

class ResultItem extends Component {
  renderStatusColumn(result) {
    if(this.props.status === STATUS_FINISHED) {
      return <span className="btn btn-primary" onClick={() => {this.props.modalResolveShow(result)}}>
              {this.props.translate('pages.event.result.confirm')}</span>
    }

    if(this.props.status === STATUS_CLOSED) {
      return this.props.translate('pages.event.errors.resolve.already_closed');
    }

    if(this.props.status !== STATUS_FINISHED) {
      return this.props.translate('pages.event.errors.resolve.need_finished');
    }
  }

  render() {
      return <tr className={this.props.result.resolved ? 'success' : ''}>
        <td>{this.props.result.description}</td>
        <td>{this.props.result.coefficient}</td>
        <td>{this.props.result.betCount}</td>
        <td>{this.props.result.betSum}</td>
        <td>
          {this.renderStatusColumn(this.props.result)}
        </td>
      </tr>
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    translate: getTranslate(state.locale)
  }
}

const mapDispatchToProps = {
  modalResolveShow
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultItem);