import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'
import { Input } from 'valuelink/tags'
import BaseModal from '../modal/BaseModal'
import { modalAddNewBetClose, modalAddNewBetAdd } from '../../actions/pages/event'
import { getGasCalculation } from '../../util/gasPriceOracle';
import { denormalizeBalance } from './../../util/token';
import { deployed } from "../../util/contracts";
import { toBytesTruffle as toBytes } from '../../util/serialityUtil';
import config from '../../data/config.json';

class ModalNewBet extends Component {

  constructor(props) {
    super(props);

    this.addBetHandler = this.addBetHandler.bind(this);

    this.state = {
      betAmount: 0,
      gasLimit: undefined,
      gasPrice: undefined,
      fee: 0,
      gasPriceStr: '',
      estimateGasError: false
    }
  }

  async componentWillMount() {
    try {
      const tokenInstance = (await deployed(this.props.web3, 'token')).tokenInstance;

      const gasAmount = await tokenInstance.transferERC223.estimateGas(
        this.props.eventData.address,
        denormalizeBalance(this.props.newBetData.amount),
        toBytes(
          {type: 'uint', size: 8, value: 1}, // action – bet
          {type: 'uint', size: 8, value: this.props.newBetData.resultIndex}, // result index
        ),
        {from: this.props.currentAddress}
      );


      const gasCalculation = await getGasCalculation(this.props.web3, gasAmount);

      this.setState({
        gasLimit: gasCalculation.gasLimit,
        gasPrice: gasCalculation.price / gasCalculation.gasLimit,
        gasPriceStr: Number(this.props.web3.toWei(gasCalculation.price / gasCalculation.gasLimit, 'gwei')).toFixed(config.view.gwei_precision) + ' gwei',
        minFee: gasCalculation.minFee,
        fee: gasCalculation.fee
      });
    } catch (e) {
      this.setState({
        estimateGasError: true
      });
    }
  }

  addBetHandler() {
    this.props.modalAddNewBetAdd(this.state.gasLimit, Math.round(this.props.web3.toWei(this.state.fee / this.state.gasLimit)));
  }

  _confirmContent() {

    return <div className="modal-new-bet">
      {this.props.save_error &&
        <div className='alert alert-danger' role='alert'>
          {this.props.save_error.message}
        </div>
      }

      {this.state.estimateGasError &&
        <div className='alert alert-danger' role='alert'>
          {this.props.translate('pages.event.estimate_gas_error')}
        </div>
      }

      <dl className="dl-horizontal">

        <dt>{this.props.translate('pages.event.result.name')}</dt>
        <dd>{this.props.newBetData.result.description}</dd>

        <dt>{this.props.translate('pages.event.result.coefficient')}</dt>
        <dd>{this.props.newBetData.result.coefficient}</dd>

        <dt>{this.props.translate('pages.event.result.bet_sum')}</dt>
        <dd>{this.props.newBetData.result.betSum}</dd>

        <dt>{this.props.translate('pages.event.your_bet')}</dt>
        <dd>{this.props.newBetData.amount}</dd>

        <br />

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
      {this.props.translate('pages.event.saved')}
    </div>
  }

  _buttons() {
    let buttons = [];

    if(this.props.newBetSaved) {
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
        title: this.props.translate('buttons.add'),
        className: 'btn-primary',
        attrs: {
          onClick: this.addBetHandler,
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
          <BaseModal handleHideModal={this.props.modalAddNewBetClose} buttons={this._buttons()} title={ this.props.translate('pages.new_event.modal.submit')} >
            { this.props.newBetSaved ? this._savedContent() : this._confirmContent() }
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
    eventData: state.event.eventData,
    newBetData: state.event.newBetData,
    newBetSaved: state.event.newBetSaved,
    sbtcBalance: state.token.sbtcBalance,
    translate: getTranslate(state.locale),
  };
}

const mapDispatchToProps = {
  modalAddNewBetClose,
  modalAddNewBetAdd
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalNewBet);