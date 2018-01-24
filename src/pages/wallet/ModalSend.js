import React, { Component } from 'react'
import { connect } from 'react-redux';
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
import store from '../../store';

class ModalSend extends Component {

  constructor(props) {
    super(props)

    this.links = {};

    this.state = {
      address: '0x9407808Bb24233D6cBd943A74BB2eF6d9c365De2',
      sum: 10,
      fee: 0,
      gasLimit: 0,
      minFee: 0,
      errors: [],
      web3: null,
      currentAddress: null,
      successResponse: null,
      successTransaction: null,
      waiting: false,
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
    this.setState({ errors: [], waiting: true });

    const contract = require('truffle-contract');
    const token = contract(TokenContract);
    token.setProvider(this.props.web3.currentProvider);

    token.deployed().then((instance) => {

      return instance.transfer(
        this.state.address,
        this.state.sum,
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

        store.dispatch(refreshBalance());
      });

    }).catch((e) => {

      let errors = this.state.errors;
      errors.push(e);
      this.setState({ errors: errors, waiting: false });

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

      return instance.transfer.estimateGas(address, sum);

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
    const addressLink = Link.state(this, 'address')
      .check( v => v, strings().validation.required)
      .check( validateTossAddress, 'Invalid address');

    const sumLink = Link.state(this, 'sum')
      .check( v => v, strings().validation.required)
      .check( v => !isNaN(parseFloat(v)), strings().validation.token.sum_is_nan)
      .check( v => parseFloat(v) >= 1, strings().validation.token.sum_is_too_small)
      .check( v => parseFloat(v) <= this.props.balance, strings().validation.token.sum_is_too_big);

    const feeLink = Link.state(this, 'fee')
      .check( v => v, strings().validation.required)
      .check( v => !isNaN(parseFloat(v)), strings().validation.token.fee_is_nan)
      .check( v => parseFloat(v) >= this.state.minFee, strings().validation.token.fee_is_too_small + this.state.minFee + ' ' + config.view.currency_symbol);

    return <form>
      <div className='has-error'>
        <div className='control-label'>
          { this._renderErrors() }
        </div>
      </div>
      <div className='form-group'>
        <label>Balance: { this.props.balance.toFixed(config.view.token_precision) } {config.view.token_symbol}</label>
      </div>
      {(
        this.props.blockedBalance > 0 ?
          <div className='form-group'>
            <label>Block sum: { this.props.blockedBalance.toFixed(config.view.token_precision) } {config.view.token_symbol}</label>
          </div> : ''
      )}
      <div className={ addressLink.error ? 'form-group has-error' : 'form-group' }>
        <label className='control-label' htmlFor='send[address]'>Address</label>
        <Input valueLink={ addressLink } type='text' className='form-control' id='send[address]' placeholder='Address' />
        <span className='help-block'>{ addressLink.error || '' }</span>
      </div>
      <div className={ sumLink.error ? 'form-group has-error' : 'form-group' }>
        <label className='control-label' htmlFor='send[sum]'>Sum</label>
        <Input valueLink={ sumLink } type='number' className='form-control' id='send[sum]' placeholder='Sum' onKeyPress={this.preventNonDigit} />
        <span className='help-block'>{ sumLink.error || '' }</span>
      </div>
      <div className={ feeLink.error ? 'form-group has-error' : 'form-group' }>
        <label className='control-label' htmlFor='send[fee]'>Fee ({config.view.currency_symbol})</label>
        <Input valueLink={ feeLink } type='number' className='form-control' id='send[fee]' placeholder='Fee' onKeyPress={this.preventNonDigit} />
        <span className='help-block'>{ feeLink.error || '' }</span>
      </div>
      <div className='form-group'>
        <span className='help-block'>{config.view.currency_symbol} Balance: { this.props.sbtcBalance.toFixed(config.view.currency_precision) }</span>
        <span className='help-block'>{ this.state.gasLimit > 0 ? 'Gas limit: ' + this.state.gasLimit.toFixed(0) : '' }</span>
        <span className='help-block'>{ this.state.gasLimit > 0 ? 'Gas price: ' + Number(this.props.web3.toWei(this.state.fee / this.state.gasLimit, 'gwei')).toFixed(config.view.gwei_precision) + ' gwei' : '' }</span>
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
          <BaseModal handleHideModal={this.props.handleHideModal} buttons={buttons} title='Send'>
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
    sbtcBalance: state.token.sbtcBalance
  };
}

export default connect(mapPropsToState)(ModalSend);
