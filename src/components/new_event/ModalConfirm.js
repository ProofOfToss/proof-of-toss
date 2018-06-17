import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'
import { Input } from 'valuelink/tags'
import { withRouter } from "react-router";
import BaseModal from '../modal/BaseModal'
import { modalCloseEvent, modalSaveEvent } from '../../actions/pages/newEvent'
import { getGasCalculation } from '../../util/gasPriceOracle';
import { deployed } from '../../util/contracts';
import { serializeEvent } from '../../util/eventUtil';
import config from '../../data/config.json';

class ModalConfirm extends Component {

  constructor(props) {
    super(props);

    this.saveEventHandler = this.saveEventHandler.bind(this);

    this.redirectTimeout = null;

    this.state = {
      gasLimit: undefined,
      gasPrice: undefined,
      fee: 0,
      gasPriceStr: '',
      estimateGasError: false
    }
  }

  componentWillMount() {
    deployed(this.props.web3, 'token', 'main').then(({tokenInstance, mainInstance}) => {
      const bytes = serializeEvent({
        name: this.props.formData.name,
        description: this.props.formData.description,
        deposit: this.props.formData.deposit,
        bidType: this.props.formData.bidType,
        category: this.props.formData.category,
        locale: this.props.formData.language,
        startDate: this.props.formData.startTime.unix(),
        endDate: this.props.formData.endTime.unix(),
        sourceUrl: this.props.formData.sourceUrls.join(','),
        tags: this.props.formData.tags,
        results: this.props.formData.results.map((result) => { return {'coefficient': result.coefficient || 0, 'description': result.description}; }),
      });

      tokenInstance.transferToContract.estimateGas(mainInstance.address, this.props.formData.deposit, bytes, {
          from: this.props.currentAddress
        })
      .then((gasAmount) => {
        return getGasCalculation(this.props.web3, gasAmount);
      })
      .then((gasCalculation) => {
        this.setState({
          gasLimit: gasCalculation.gasLimit,
          gasPrice: gasCalculation.gasPrice,
          minFee: gasCalculation.minFee,
          fee: gasCalculation.fee
        });
      }).catch((e) => {
        this.setState({
          estimateGasError: true
        });
      });
    });
  }

  componentWillUnmount() {
    if(this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }

  saveEventHandler() {
    this.props.saveEvent(this.state.gasLimit, Math.round(this.props.web3.toWei(this.state.fee / this.state.gasLimit)));
  }

  _confirmContent() {

    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
    const urlRegex = new RegExp(expression);

    return <div className="modal-confirm-new-event">

      {this.props.save_error &&
        <div className='alert alert-danger' role='alert'>
          {this.props.save_error}
        </div>
      }

      {this.state.estimateGasError &&
        <div className='alert alert-danger' role='alert'>
          {this.props.translate('pages.new_event.estimate_gas_error')}
        </div>
      }

      <dl className="dl-horizontal">
        <dt>{this.props.translate('pages.new_event.form.language')}</dt>
        <dd>{this.props.formData.language}</dd>

        <dt>{this.props.translate('pages.new_event.form.category')}</dt>
        <dd>{this.props.formData.category}</dd>

        <dt>{this.props.translate('pages.new_event.form.name')}</dt>
        <dd>{this.props.formData.name}</dd>

        <dt>{this.props.translate('pages.new_event.form.bid_type')}</dt>
        <dd>{this.props.formData.bidType}</dd>

        <dt>{this.props.translate('pages.new_event.form.deposit')}</dt>
        <dd>{this.props.formData.deposit}</dd>

        <dt>{this.props.translate('pages.new_event.form.tags.label')}</dt>
        <dd>{this.props.formData.tags.join(', ')}</dd>

        <dt>{this.props.translate('pages.new_event.form.dates.date_start')}</dt>
        <dd>{this.props.formData.startTime.format('LLL')}</dd>

        <dt>{this.props.translate('pages.new_event.form.dates.date_end')}</dt>
        <dd>{this.props.formData.endTime.format('LLL')}</dd>

        <dt>{this.props.translate('pages.new_event.form.description')}</dt>
        <dd>{this.props.formData.description}</dd>

        <dt>{this.props.translate('pages.new_event.form.source_url.label')}</dt>
        <dd className="sourceUrl">
          <ul className="list-unstyled">
            {
              this.props.formData.sourceUrls.map((sourceUrl, key) => {
                if (sourceUrl.match(urlRegex)) {
                  return <li key={key}><a href={sourceUrl} target="_blank">{sourceUrl}</a></li>
                }

                return <li key={key}>{sourceUrl}</li>
              })
            }
          </ul>
        </dd>

        <dt>{this.props.translate('pages.new_event.form.results.label')}</dt>
        <dd>
          <ul className="list-unstyled">
            {this.props.formData.results.map((result, key) => {
              return <li key={key}>
                {result.description}&nbsp;{result.coefficient}&nbsp;
              </li>
            }, this)}
          </ul>
        </dd>

        {this.state.gasLimit && <div className="fees-block">
            <dt className="fees-block-fee-label">{ this.props.translate('pages.wallet.send.fee') } ({config.view.currency_symbol})</dt>
            <dd className="fees-block-fee-field">
              <div className={ this.feeLink.error ? 'form-group has-error' : 'form-group' }>
                <Input valueLink={ this.feeLink } type='number' className='form-control' id='event[fee]' placeholder={ this.props.translate('pages.new_event.fee') } />
                <span className='help-block'>{ this.feeLink.error || '' }</span>
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
    this.redirectTimeout = setTimeout(() => {
      this.props.router.push(`/${this.props.router.params.locale}/event/${this.props.eventAddress}`);
    }, 5000);

    return <div className='alert alert-success' role='alert'>
      {this.props.translate('pages.new_event.saved')}
    </div>
  }

  _buttons() {
    let buttons = [];

    if(this.props.saved) {
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
        title: this.props.translate('buttons.create'),
        className: 'btn-primary',
        attrs: {
          onClick: this.saveEventHandler,
          disabled: this.feeLink.error || this.props.saving
        }
      }];
    }

    return buttons;
  }

  render() {
    
    this.feeLink = Link.state(this, 'fee')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => !isNaN(parseFloat(v)), this.props.translate('validation.token.fee_is_nan'))
      .check( v => parseFloat(v) >= this.state.minFee, this.props.translate('validation.token.fee_is_too_small', {
        fee: this.state.minFee,
        symbol: config.view.currency_symbol
      }));

    return(
      <main className='container'>
        <div>
          <BaseModal
            title={this.props.translate('pages.new_event.modal.submit')}
            handleHideModal={this.props.modalClose}
            buttons={this._buttons()}
            showInProgress={this.props.saving}
            showInProgressMessage='pages.new_event.saving'
          >
            { this.props.saved ? this._savedContent() : this._confirmContent() }
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
    saving: state.newEvent.saving,
    saved: state.newEvent.saved,
    save_error: state.newEvent.save_error,
    formData: state.newEvent.formData,
    eventAddress: state.newEvent.eventAddress,
    sbtcBalance: state.token.sbtcBalance,
    translate: getTranslate(state.locale),
  };
}

const mapDispatchToProps = {
  modalClose: modalCloseEvent,
  saveEvent: modalSaveEvent
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ModalConfirm));