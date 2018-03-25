import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'
import moment from 'moment';

import BootstrapInput from '../../components/form/BootstrapInput'

import { STATUS_PUBLISHED, STATUS_ACCEPTED } from '../../util/eventUtil';
import ModalNewBet from './ModalNewBet';
import { newBet } from '../../actions/pages/event';

class ResultsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      betAmount_0: 0,
      betAmount_1: 0,
      betAmount_2: 0,
      showErrors: false,
      errors: {}
    }
  }

  newBet(resultIndex) {
    const valueLinkKey = `betAmount_${resultIndex}`;
    const valueLink = this.links[valueLinkKey];

    if(valueLink.error) {
      let errors = {...this.state.errors};
      errors[valueLinkKey] = true;

      this.setState({
        showErrors: true,
        errors: errors
      })
    } else {
      let result = this.props.results[resultIndex];
      this.props.newBet(result, resultIndex, valueLink.value)
    }
  }

  allowBidding() {
    return (
      moment.unix(this.props.endTime) > moment() &&
      [STATUS_PUBLISHED, STATUS_ACCEPTED].indexOf(this.props.status)
    )
  }

  renderAllowBidding() {
    return <Fragment>
      <table className="table table-striped results"><tbody>
      <tr>
        <th>{this.props.translate('pages.event.result.name')}</th>
        <th>{this.props.translate('pages.event.result.coefficient')}</th>
        <th>{this.props.translate('pages.event.result.bet_count')}</th>
        <th>{this.props.translate('pages.event.result.bet_sum')}</th>
        <th />
      </tr>
      {this.props.results.map((result, key) => {
        const betAmountLink = this.links[`betAmount_${key}`];

        const inputAttr = {
          type: 'number',
          id: `event[bet_amount_${key}]`,
          placeholder: this.props.translate('pages.event.bet_amount'),
          min: 0
        };

        return <tr key={key}>
          <td>{result.description}</td>
          <td>{result.coefficient}</td>
          <td>{result.betCount}</td>
          <td>{result.betSum}</td>
          <td>
            <form className="form-inline">
              <BootstrapInput valueLink={betAmountLink} showError={this.state.errors[`betAmount_${key}`]} attr={inputAttr} />
              <span className="btn btn-primary" onClick={() => this.newBet(key)}>
                {this.props.translate('pages.event.newBet')}</span>
            </form>
          </td>
        </tr>
      }, this)}
      </tbody></table>
      {this.props.showNewBetModal ? <ModalNewBet eventInstance={this.props.eventInstance} /> : null}
    </Fragment>
  }

  renderDisallowBidding() {
    return <div className="alert alert-warning" role="alert">{this.props.translate('pages.event.disallow_betting')}</div>
  }

  render() {
    //Create valueLinks for new bet field
    this.props.results.forEach((result, key) => {
      Link.state(this, `betAmount_${key}`)
        .check(v => v, this.props.translate('validation.required'))
        .check(v => !isNaN(parseFloat(v)), this.props.translate('validation.token.fee_is_nan'))
        .check(v => parseFloat(v) >= 1, this.props.translate('validation.to_small', {value: 1}))
      ;
    });

    let content = '';
    if(this.allowBidding()) {
      content = this.renderAllowBidding();
    } else {
      content = this.renderDisallowBidding();
    }

    return <div>
      {content}
    </div>
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    allowance: state.event.allowance,
    showNewBetModal: state.event.showNewBetModal,
    translate: getTranslate(state.locale)
  }
}

const mapDispatchToProps = {
  newBet
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList);