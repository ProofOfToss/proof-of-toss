import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'
import EventBaseContract from '../../../../build/contracts/EventBase.json';
import { Input } from 'valuelink/tags'
import BaseModal from '../../../components/modal/BaseModal'
import { modalWithdrawClose, modalWithdrawApprove } from '../../../actions/pages/event'
import { getGasCalculation } from '../../../util/gasPriceOracle';
import config from '../../../data/config.json';

class ModalWithdraw extends Component {

  constructor(props) {
    super(props);

    this.approveHandler = this.approveHandler.bind(this);

    this.state = {
      gasLimit: undefined,
      gasPrice: undefined,
      fee: 0,
      gasPriceStr: '',
      estimateGasError: false
    }
  }

  async componentWillMount() {
    try {
      const contract = require('truffle-contract');
      const eventBase = contract(EventBaseContract);
      eventBase.setProvider(this.props.web3.currentProvider);
      const eventBaseInstance = eventBase.at(this.props.withdraw.address);

      let gasAmount;

      switch (this.props.withdraw.type) {
        case 'userBet':
          gasAmount = await eventBaseInstance.withdrawPrize.estimateGas(
            this.props.withdraw.userBet,
            {from: this.props.currentAddress}
          );

          break;
        case 'eventCreatorReward':
          gasAmount = await eventBaseInstance.withdrawReward.estimateGas(
            {from: this.props.currentAddress}
          );

          break;
        default:
          throw new Error('Invalid withdrawal type');
      }

      const gasCalculation = await getGasCalculation(this.props.web3, gasAmount);

      this.setState({
        gasLimit: gasCalculation.gasLimit,
        gasPrice: gasCalculation.price / gasCalculation.gasLimit,
        gasPriceStr: Number(this.props.web3.toWei(gasCalculation.price / gasCalculation.gasLimit, 'gwei')).toFixed(config.view.gwei_precision) + ' gwei',
        minFee: gasCalculation.minFee,
        fee: gasCalculation.fee
      });
    } catch (e) {
      console.log(e);
      this.setState({
        estimateGasError: true
      });
    }
  }

  approveHandler() {
    this.props.modalWithdrawApprove(this.state.gasLimit, Math.round(this.props.web3.toWei(this.state.fee / this.state.gasLimit)));
  }

  _confirmContent() {

    return <div className="modal-resolve">
      {this.state.estimateGasError &&
        <div className='alert alert-danger' role='alert'>
          {this.props.translate('pages.event.estimate_gas_error')}
        </div>
      }

      <dl className="dl-horizontal">

        {this.state.gasLimit && <div className="fees-block">
            <dt className="fees-block-fee-label">{ this.props.translate('pages.wallet.send.fee') } ({config.view.currency_symbol})</dt>
            <dd className="fees-block-fee-field">
              <div className={ this.links.fee.error ? 'form-group has-error' : 'form-group' }>
                <Input valueLink={ this.links.fee } type='number' className='form-control' id='event[fee]' placeholder={ this.props.translate('pages.new_event.fee') } />
                <span className='help-block'>{ this.links.fee.error || '' }</span>
              </div>
            </dd>

            <dt>{this.props.translate('pages.wallet.send.currency_balance', {currency: config.view.currency_symbol})}</dt>
            <dd>{this.props.sbtcBalance.toFixed(config.view.currency_precision)}</dd>

            <dt>{this.props.translate('pages.new_event.gas_limit')}</dt>
            <dd>{this.state.gasLimit}</dd>

            <dt>{this.props.translate('pages.new_event.gas_price')}</dt>
            <dd>{Number(this.props.web3.toWei(this.state.fee / this.state.gasLimit, 'gwei')).toFixed(config.view.gwei_precision) + ' gwei'}</dd>
          </div>
        }
      </dl>
    </div>
  }

  _savedContent() {
    return <div className='alert alert-success' role='alert'>
      {this.props.translate('pages.withdraw.withdraw_approved')}
    </div>
  }

  _buttons() {
    let buttons = [];

    if(this.props.withdrawApproved) {
      buttons = [{
        title: this.props.translate('buttons.ok'),
        className: 'btn-default',
        attrs: {
          'data-dismiss': 'modal'
        }
      }]
    } else {
      buttons = [{
        title: this.props.translate('buttons.cancel'),
        className: 'btn-default',
        attrs: {
          'data-dismiss': 'modal'
        }
      },
      {
        title: this.props.translate('buttons.withdraw'),
        className: 'btn-primary',
        attrs: {
          onClick: this.approveHandler,
          disabled: this.links.fee.error
        }
      }];
    }

    return buttons;
  }

  render() {

    Link.state(this, 'fee')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => !isNaN(parseFloat(v)), this.props.translate('validation.token.fee_is_nan'))
      .check( v => parseFloat(v) >= this.state.minFee, this.props.translate('validation.token.fee_is_too_small') + this.state.minFee + ' ' + config.view.currency_symbol);

    return(

      <main className='container'>
        <div>
          <BaseModal handleHideModal={this.props.modalWithdrawClose} buttons={this._buttons()} title={ this.props.translate('pages.withdraw.modal_withdraw_title')} >
            { this.props.withdrawApproved ? this._savedContent() : this._confirmContent() }
          </BaseModal>
        </div>
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    sbtcBalance: state.token.sbtcBalance,
    translate: getTranslate(state.locale),
    eventData: state.event.eventData,
    withdraw: state.event.withdraw,
    withdrawApproved: state.event.withdrawApproved,
  };
}

const mapDispatchToProps = {
  modalWithdrawClose,
  modalWithdrawApprove
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalWithdraw);