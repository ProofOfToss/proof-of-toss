import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

import { modalResolveShow } from '../../../actions/pages/event';
import ResultItem from './ResultItem';
import { STATUS_FINISHED, STATUS_CLOSED } from "../../../util/eventUtil";
import { RESULT_DID_NOT_HAPPEN } from "../../../classes/event";

import ModalResolve from './ModalResolve';

class ResultsList extends Component {

  constructor(props) {
    super(props);

    this.didNotHappen = this.didNotHappen.bind(this);
  }

  didNotHappen() {
    const result = {
      index: 254,
      description: this.props.translate('pages.event.did_not_happen'),
      coefficient: 0,
      betSum: 0
    };

    this.props.modalResolveShow(result);
  }

  render() {
    return <Fragment>
      <table className="table table-striped results"><tbody>
      <tr>
        <th class="col-md-6">{this.props.translate('pages.event.result.name')}</th>
        <th class="col-md-1">{this.props.translate('pages.event.result.coefficient')}</th>
        <th class="col-md-1">{this.props.translate('pages.event.result.bet_count')}</th>
        <th class="col-md-1">{this.props.translate('pages.event.result.bet_sum')}</th>
        <th class="col-md-3" />
      </tr>
      {this.props.results.map((result) => {
        return <ResultItem
          key={result.index}
          result={result}
          status={this.props.status}
          resolvedResult={this.props.resolvedResult}
        />
      }, this)}
      </tbody></table>

      {this.props.status === STATUS_FINISHED &&
        <div href="#" className="btn btn-primary" onClick={this.didNotHappen}>
          {this.props.translate('pages.event.did_not_happen')}
        </div>
      }

      {
        this.props.status === STATUS_CLOSED &&
        this.props.resolvedResult === RESULT_DID_NOT_HAPPEN &&
        <div className="did_not_happen_success">
          {this.props.translate('pages.event.did_not_happen')}
        </div>
      }

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