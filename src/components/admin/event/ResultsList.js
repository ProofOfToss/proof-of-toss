import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

import { modalResolveShow } from '../../../actions/pages/event';
import { STATUS_FINISHED, STATUS_CLOSED } from "../../../util/eventUtil";

import ModalResolve from './ModalResolve';

class ResultsList extends Component {

  renderStatusColumn(result) {
    if(this.props.getState === STATUS_FINISHED) {
      return <span className="btn btn-primary" onClick={() => {this.props.modalResolveShow(result)}}>
              {this.props.translate('pages.event.result.confirm')}</span>
    }

    if(this.props.status === STATUS_CLOSED) {
      return this.props.translate('pages.event.errors.resolve.already_closed');
    }

    if(this.props.getStatus !== STATUS_FINISHED) {
      return this.props.translate('pages.event.errors.resolve.need_finished');
    }
  }

  render() {
    return <Fragment>
      <div>
        <table className="table table-striped results"><tbody>
        <tr>
          <th>{this.props.translate('pages.event.result.name')}</th>
          <th>{this.props.translate('pages.event.result.coefficient')}</th>
          <th>{this.props.translate('pages.event.result.bet_count')}</th>
          <th>{this.props.translate('pages.event.result.bet_sum')}</th>
          <th />
        </tr>
        {this.props.results.map((result, key) => {
          return <tr key={key}>
            <td>{result.description}</td>
            <td>{result.coefficient}</td>
            <td>{result.betCount}</td>
            <td>{result.betSum}</td>
            <td>
              {this.renderStatusColumn(result)}
            </td>
          </tr>
        }, this)}
        </tbody></table>
      </div>
      {this.props.showResolveModal ? <ModalResolve /> : null}
    </Fragment>
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    translate: getTranslate(state.locale),
    showResolveModal: state.event.showResolveModal
  }
}

const mapDispatchToProps = {
  modalResolveShow
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList);