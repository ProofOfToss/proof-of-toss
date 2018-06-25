import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'
import { validateTossAddress } from '../../util/validators';

import config from '../../data/config.json';
import { denormalizeBalance } from './../../util/token';
import {submitQuery} from "../../actions/pages/faucet";
import BootstrapInput from '../../components/form/BootstrapInput';
import ReCAPTCHA from 'react-google-recaptcha';

class Index extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.isValid = this.isValid.bind(this);
    this.storeCaptcha = this.storeCaptcha.bind(this);

    this.state = {
      showErrors: false,
      errors: {},
      address: props.address,
    }
  }

  isValid() {
    if (!this.state.captchaResponse) {
      const errors = this.state.errors;
      errors.recaptcha = this.props.translate('pages.faucet.recaptchaError');
      this.setState({errors: errors});
    }

    return this.links.address.error === undefined && this.state.captchaResponse;
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.isValid()) {
      const faucetUrl = `${config.faucetUrl}?account=${this.state.address}&captchaResponse=${this.state.captchaResponse}`;
      this.props.submitQuery(faucetUrl);
    } else {
      this.setState({showErrors: true});
    }
  }

  storeCaptcha(captchaValue){
    console.log(captchaValue);

    const errors = this.state.errors;
    delete errors.recaptcha;
    this.setState({errors: errors});

    this.setState({captchaResponse: captchaValue});
  }

  render() {
    const addressLink = Link.state(this, 'address')
      .check( v => v, this.props.translate('validation.required'))
      .check( validateTossAddress, this.props.translate('validation.invalid_address'));

    const addressAttr = {
      id: 'faucet[address]',
      placeholder: this.props.translate('pages.faucet.address')
    };

    return(
      <main className="container faucet-index">
        <form className="form-horizontal" onSubmit={this.handleSubmit}>

          <BootstrapInput valueLink={addressLink} label={this.props.translate('pages.faucet.address')} showError={this.state.showErrors}
                          attr={addressAttr} horizontal={true} />

          <div className="row">
            <label className="col-sm-2 control-label" />
            <div className="col-sm-10">
              <ReCAPTCHA sitekey={config.recaptchaKey} onChange={this.storeCaptcha}/>
              {
                this.state.showErrors && this.state.errors.recaptcha
                  ? <div className="help-block">
                    {this.state.errors.recaptcha}
                  </div>
                  : null
              }
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button type="submit" disabled={!!this.props._submitQuery || !!this.props.fetchingTransactionStatus} className="btn btn-default">{this.props.translate('pages.faucet.get')}</button>
            </div>
          </div>
        </form>

        {this.props.fetchingTransactionStatus && <div className="alert alert-warning" role="alert">
          {this.props.translate('pages.faucet.fetchingTransaction', {txHash: `<a href="${config.txCheckUrl}${this.props.txHash}" target="_blank"}>${this.props.txHash}</a>`})}
        </div>}

        {this.props.submittingQuery && <div className="alert alert-warning" role="alert">
          {this.props.translate('pages.faucet.submittingQuery')}
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
    submittingQuery: state.faucet.submitQuery,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = {
  submitQuery
};


export default connect(mapPropsToState, mapDispatchToProps)(Index);
