import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import BaseModal from '../../components/modal/BaseModal'
import CopyToClipboard from '../../components/clipboard/CopyToClipboard'
import { strings } from '../../util/i18n';
import config from '../../data/config.json';
import { getGasPrices } from '../../util/gasPriceOracle';
import { validateTossAddress } from '../../util/validators';
import Link from 'valuelink'
import { Input } from 'valuelink/tags'
import TokenContract from '../../../build/contracts/Token.json'
import { refreshBalance } from '../../actions/token'
import { transactionSaved } from '../../actions/pages/wallet'
import store from '../../store';
import { formatBalance, denormalizeBalance } from './../../util/token'

class ModalSend extends Component {

  constructor(props) {
    super(props)

    this.links = {};

    this.state = {
      address: '',
      sum: 0,
      fee: 0,
      gasLimit: 0,
      minFee: 0,
      errors: [],
      web3: null,
      currentAddress: null,
      successResponse: null,
      successTransaction: null,
      waiting: false,
      formPrestine: true,
      addressPrestine: true,
      sumPrestine: true,
      feePrestine: true,
    };

    this.calcFee = this.calcFee.bind(this);
    this.onSendClick = this.onSendClick.bind(this);
    this._renderTransaction = this._renderTransaction.bind(this);
    this._renderErrors = this._renderErrors.bind(this);
    this._renderForm = this._renderForm.bind(this);
  }

  componentWillMount() {
    getGasPrices(this.props.web3).then((gasPrices) => {
      this.setState({ gasPrices: gasPrices });
      this.calcFee();
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.balance !== nextProps.balance) {
      if(this.links['sum']) {
        delete this.links['sum'];
      }
    }

    if (this.state.formPrestine) {
      if (this.state.address !== nextState.address) {
        this.setState({addressPrestine: false});
      }

      if (this.state.sum !== nextState.sum) {
        this.setState({sumPrestine: false});
      }

      if (this.state.fee !== nextState.fee) {
        this.setState({feePrestine: false});
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.gasPrices) {
      return;
    }

    if (!this.state.minFee || (prevState.fee === this.state.fee && (prevState.address !== this.state.address || prevState.sum !== this.state.sum))) {
      this.calcFee();
    }
  }

  onSendClick() {
    this.setState({formPrestine: false}, () => {
      const {hasError} = this.validateForm();

      if(hasError) {
        return;
      }

      this.setState({ errors: [], waiting: true });

      const contract = require('truffle-contract');
      const token = contract(TokenContract);
      token.setProvider(this.props.web3.currentProvider);

      token.deployed().then((instance) => {

        return instance.transfer(
          this.state.address,
          denormalizeBalance(this.state.sum),
          {
            from: this.props.currentAddress,
            gasPrice: Math.round(this.props.web3.toWei(this.state.fee / this.state.gasLimit)),
            gas: this.state.gasLimit,
          }
        );

      }).then((result) => {

        this.setState({ successResponse: result });

        this.props.web3.eth.getTransaction(result.tx, (err, tx) => {
          if (err) {
            console.log(err);
            return;
          }

          this.setState({ successTransaction: tx, waiting: false });

          store.dispatch(refreshBalance(this.props.currentAddress));
          this.props.transactionSaved(tx, denormalizeBalance(this.state.sum));
        });

      }).catch((e) => {
        let msg = '';
        let errors = this.state.errors;

        if (
          // firefox do not have normal msg, so trying to check for method name in call stack
          e.message.indexOf('nsetTxStatusRejected') !== -1
          // chrome have normal message
          || e.message.indexOf('User denied transaction signature') !== -1) {
          msg = this.props.translate('pages.wallet.send.user_denied_tx');
        } else {
          msg = this.props.translate('pages.wallet.send.unexpected_error');
        }

        errors.push(new Error(msg));

        this.setState({ errors: errors, waiting: false });
      });
    });
  }

  preventNonDigit (e) {
    const { charCode } = e;

    if (e.ctrlKey) {
      return;
    }

    if (charCode && (charCode < 48 || charCode > 57) && charCode !== 45 && charCode !== 46) {
      // char is number or - or .
      e.preventDefault();
    }
  }

  calcFee() {
    const address = validateTossAddress(this.state.address) ? this.state.address : this.state.currentAddress;
    const sum = this.state.sum > 0 ? this.state.sum : 1;

    const contract = require('truffle-contract');
    const token = contract(TokenContract);
    token.setProvider(this.props.web3.currentProvider);

    token.deployed().then((instance) => {

      return instance.transfer.estimateGas(address, denormalizeBalance(sum));

    }).then((result) => {
      const gas = Math.round( Number(result) * 1.5); // x 1.5 to prevent surprise out-of-gas errors
      const minPrice = this.props.web3.fromWei((gas * this.state.gasPrices.min), 'ether');
      const price = this.props.web3.fromWei((gas * this.state.gasPrices.avg), 'ether');

      this.setState({ minFee: minPrice, gasLimit: gas });

      if (this.state.fee < minPrice) {
        this.setState({ fee: price });
      }
    }).catch(function() {});
  }

  validateForm() {
    const addressLink = Link.state(this, 'address');
    const sumLink = Link.state(this, 'sum');
    const feeLink = Link.state(this, 'fee');

    if (!this.state.formPrestine || !this.state.addressPrestine) {
      addressLink
        .check( v => v, strings().validation.required)
        .check( validateTossAddress, 'Invalid address');
    }

    if (!this.state.formPrestine || !this.state.sumPrestine) {
      sumLink
        .check( v => v, strings().validation.required)
        .check( v => !isNaN(parseFloat(v)), strings().validation.token.sum_is_nan)
        .check( v => v.indexOf(',') === -1, strings().validation.token.invalid_delimiter)
        .check( v => {
          let splittedValue = (parseFloat(v) + '').split('.');

          if (splittedValue.length === 1) {
            // no decimals
            return parseFloat(splittedValue[0]) === parseFloat(v);
          }

          if (splittedValue.length === 0 || splittedValue.length > 2) {
            // something is wrong (0 means no value is supplied, >2 means weird things)
            return false;
          }

          // check max decimal points
          return splittedValue[1].length <= 4;
        }, strings().validation.token.wrong_precision )
        .check( v => parseFloat(v) >= config.view.token_min_send_value, strings().validation.token.sum_is_too_small)
        .check(
          v => denormalizeBalance(v) <= this.props.balance,
          strings().validation.token.sum_is_too_big
        );
    }

    if (!this.state.formPrestine || !this.state.feePrestine) {
      feeLink
        .check( v => v, strings().validation.required)
        .check( v => !isNaN(parseFloat(v)), strings().validation.token.fee_is_nan)
        .check( v => parseFloat(v) >= this.state.minFee, strings().validation.token.fee_is_too_small + this.state.minFee + ' ' + config.view.currency_symbol);
    }

    return {
      addressLink,
      sumLink,
      feeLink,
      hasError: addressLink.error || sumLink.error || feeLink.error
    }
  }

  _renderErrors() {
    let elements = [];
    for(let i = 0; i < this.state.errors.length; i++) {
      let error = this.state.errors[i];

      if (typeof error === 'object' && error.message) {
        error = error.message;
      } else if (typeof error !== 'string') {
        error = JSON.stringify(error, null, "\t");
      }

      elements.push(<li key={i}>{error}</li>);
    }

    return <ul className='list-unstyled'>{elements} </ul>;
  }

  _renderForm() {
    const {addressLink, sumLink, feeLink} = this.validateForm();

    return <form>
      <div className='has-error'>
        <div className='control-label'>
          { this._renderErrors() }
        </div>
      </div>
      <div className='form-group'>
        <label>{ this.props.translate('pages.wallet.send.balance') }: { formatBalance(this.props.balance) } {config.view.token_symbol}</label>
      </div>
      {(
        this.props.blockedBalance > 0 ?
          <div className='form-group'>
            <label>{ this.props.translate('pages.wallet.send.block_sum') }: { formatBalance(this.props.blockedBalance) } {config.view.token_symbol}</label>
          </div> : ''
      )}
      <div className={ addressLink.error ? 'form-group has-error' : 'form-group' }>
        <label className='control-label' htmlFor='send[address]'>{ this.props.translate('pages.wallet.send.address') }</label>
        <Input valueLink={ addressLink } type='text' className='form-control' id='send[address]' placeholder={ this.props.translate('pages.wallet.send.address') } />
        <span className='help-block'>{ addressLink.error || '' }</span>
      </div>
      <div className={ sumLink.error ? 'form-group has-error' : 'form-group' }>
        <label className='control-label' htmlFor='send[sum]'>{ this.props.translate('pages.wallet.send.sum') }</label>
        <Input valueLink={ sumLink } type='number' className='form-control' id='send[sum]' placeholder={ this.props.translate('pages.wallet.send.sum') } onKeyPress={this.preventNonDigit} />
        <span className='help-block'>{ sumLink.error || '' }</span>
      </div>
      <div className={ feeLink.error ? 'form-group has-error' : 'form-group' }>
        <label className='control-label' htmlFor='send[fee]'>{ this.props.translate('pages.wallet.send.fee') } ({config.view.currency_symbol})</label>
        <Input valueLink={ feeLink } type='number' className='form-control' id='send[fee]' placeholder={ this.props.translate('pages.wallet.send.fee') } onKeyPress={this.preventNonDigit} />
        <span className='help-block'>{ feeLink.error || '' }</span>
      </div>
      <div className='form-group'>
        <span className='help-block'>{ this.props.translate('pages.wallet.send.currency_balance', {currency: config.view.currency_symbol}) }: { this.props.sbtcBalance.toFixed(config.view.currency_precision) }</span>
        <span className='help-block'>{ this.state.gasLimit > 0 ? this.props.translate('pages.wallet.send.gas_limit') + ': ' + this.state.gasLimit.toFixed(0) : '' }</span>
        <span className='help-block'>{ this.state.gasLimit > 0 ? this.props.translate('pages.wallet.send.gas_price') + ': ' +  Number(this.props.web3.toWei(this.state.fee / this.state.gasLimit, 'gwei')).toFixed(config.view.gwei_precision) + ' gwei' : '' }</span>
      </div>
    </form>
  }

  _renderTransaction() {
    return <div>
      <div className='alert alert-success' role='alert'>
        {this.state.sum} {config.view.token_symbol} successfully sent to {this.state.address}
      </div>
      <div>
        <table className='table'>
          <tbody>
          <tr>
            <th>Tx</th>
            <td>
              <CopyToClipboard style={{width: '300px'}} text={this.state.successResponse.tx} data={this.state.successResponse.tx} />
            </td>
          </tr>
          <tr><th>Block number</th><td>{this.state.successResponse.receipt.blockNumber}</td></tr>
          <tr><th>Gas used</th><td>{Number(this.state.successResponse.receipt.gasUsed)}</td></tr>
          <tr><th>Gas price</th><td>{Number(this.state.successTransaction.gasPrice)}</td></tr>
          <tr><th>Fee</th><td>{
            this.props.web3.fromWei(
              Number(this.state.successTransaction.gasPrice) * Number(this.state.successResponse.receipt.gasUsed),
              'ether'
            )
          }</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  }

  render() {
    const content = this.state.successTransaction ? this._renderTransaction() : this._renderForm();
    let isFormValid = false;

    if(this.links['address'] && this.links['sum'] && this.links['fee']) {
      isFormValid = !(this.links['address'].error || this.links['sum'].error || this.links['fee'].error);
    }

    let buttons;

    if (this.state.successTransaction) {
      buttons = [{
          title: 'Close',
          className: 'btn-primary',
          attrs: {
            'data-dismiss': 'modal'
          }
        }
      ];
    } else {
      buttons = [{
        title: 'Cancel',
        className: 'btn-default',
        attrs: {
          'data-dismiss': 'modal',
          disabled: this.state.waiting
        }
      },
        {
          title: 'Send',
          className: 'btn-primary',
          attrs: {
            onClick: this.onSendClick,
            disabled: this.state.waiting || !isFormValid || this.state.successTransaction
          }
        }
      ];
    }

    return(
      <main className='container'>
        <div>
          <BaseModal handleHideModal={this.props.handleHideModal} buttons={buttons} title={ this.props.translate('pages.wallet.send.title') }>
            { content }
          </BaseModal>
        </div>
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    balance: state.token.balance,
    blockedBalance: state.token.blockedBalance,
    decimals: state.token.decimals,
    sbtcBalance: state.token.sbtcBalance,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = {
  transactionSaved
};

export default connect(mapPropsToState, mapDispatchToProps)(ModalSend);
