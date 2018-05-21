import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'

import config from '../../data/config.json';
import { denormalizeBalance } from './../../util/token';
import {submitQuery} from "../../actions/pages/faucet";
import BootstrapInput from '../../components/form/BootstrapInput';

class Index extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.isValid = this.isValid.bind(this);

    this.state = {
      showErrors: false,
      errors: {},
      address: props.address,
      amount: 1,

    }
  }

  isValid() {
    return this.links.address.error === undefined && this.links.amount.error === undefined;
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.isValid()) {
      const faucetUrl = `${config.faucetUrl}?account=${this.state.address}&sum=${denormalizeBalance(this.state.amount)}`;
      this.props.submitQuery(faucetUrl);
    } else {
      this.setState({showErrors: true});
    }
  }

  render() {
    const addressLink = Link.state(this, 'address')
      .check( v => v, this.props.translate('validation.required'));

    const amountLink = Link.state(this, 'amount')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.to_small', {value: 1}));

    const addressAttr = {
      id: 'faucet[address]',
      placeholder: this.props.translate('pages.faucet.address')
    };

    const amountAttr = {
      type: 'number',
      id: 'faucet[amount]',
      placeholder: this.props.translate('pages.faucet.amount'),
      min: 1
    };

    return(
      <main className="container faucet-index">
        <form className="form-horizontal" onSubmit={this.handleSubmit}>

          <BootstrapInput valueLink={addressLink} label={this.props.translate('pages.faucet.address')} showError={this.state.showErrors}
                          attr={addressAttr} horizontal={true} />
          <BootstrapInput valueLink={amountLink} label={this.props.translate('pages.faucet.amount')} showError={this.state.showErrors}
                          attr={amountAttr} horizontal={true} />
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button type="submit" disabled={!!this.props._submitQuery || !!this.props.fetchingTransactionStatus} className="btn btn-default">{this.props.translate('pages.faucet.add')}</button>
            </div>
          </div>
        </form>

        {this.props.fetchingTransactionStatus && <div className="alert alert-warning" role="alert">
          {this.props.translate('pages.faucet.fetchingTransaction', {txHash: `<a href="${config.txCheckUrl}${this.props.txHash}" target="_blank"}>${this.props.txHash}</a>`})}
        </div>}

        {this.props.successTransaction && <div className="alert alert-success alert-dismissible" role="alert">
          <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          {this.props.translate('pages.faucet.successTransaction')}
        </div>}

        {this.props.submitQueryError && <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          {this.props.translate('pages.faucet.submitQueryError')}
        </div>}
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    balance: state.token.balance,
    address: state.user.address,
    fetchingTransactionStatus: state.faucet.fetchingTransactionStatus,
    submitQueryError: state.faucet.submitQueryError,
    _submitQuery: state.faucet.submitQuery,
    txHash: state.faucet.txHash,
    successTransaction: state.faucet.successTransaction,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = {
  submitQuery
};


export default connect(mapPropsToState, mapDispatchToProps)(Index);
