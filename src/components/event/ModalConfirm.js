import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import BaseModal from '../modal/BaseModal'
import { modalCloseEvent, modalSaveEvent } from '../../actions/pages/newEvent'
import { getGasPrices } from '../../util/gasPriceOracle';
import MainContract from '../../../build/contracts/Main.json'

class ModalConfirm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      gasLimit: undefined
    }
  }

  componentWillMount() {
    const contract = require('truffle-contract');
    const main = contract(MainContract);
    main.setProvider(this.props.web3.currentProvider);

    getGasPrices(this.props.web3).then((gasPrices) => {

      main.deployed().then((instance) => {

        const tags = this.props.formData.tags.reduce((previousValue, currentValue) => {
          if(previousValue.length > 0) {
            previousValue += '.';
          }

          return `${previousValue}${this.props.formData.language}.${currentValue}`
        }, '');

        const results = this.props.formData.results.reduce((previousValue, currentValue) => {
          if(previousValue.length > 0) {
            previousValue += '.';
          }

          return `${previousValue}${currentValue.name}.${currentValue.coefficient}`
        }, '');

        return instance.newEvent.estimateGas(this.props.formData.name, this.props.formData.deposit, this.props.formData.description, 1,
          `${this.props.formData.category}.${this.props.formData.language}.${this.props.formData.startTime.unix()}.${this.props.formData.endTime.unix()}`,
          this.props.formData.sourceUrls[0], tags, results);

      }).then((result) => {
        const gas = Math.round( Number(result) * 1.5);
        const price = this.props.web3.fromWei((gas * gasPrices.avg), 'ether');

        this.setState({
          gasLimit: gas.toFixed(0),
          price: price
        });


      }).catch(function() {});
    });
  }

  _confirmContent() {
    return <div>

      {this.props.save_error &&
        <div className='alert alert-danger' role='alert'>
          {this.props.save_error.message}
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

        <dt>{this.props.translate('pages.new_event.form.tags')}</dt>
        <dd>{this.props.formData.tags.join(', ')}</dd>

        <dt>{this.props.translate('pages.new_event.form.time_zone')}</dt>
        <dd>{this.props.formData.timeZone}</dd>

        <dt>{this.props.translate('pages.new_event.form.date_start')}</dt>
        <dd>{this.props.formData.startTime.format('LLL')}</dd>

        <dt>{this.props.translate('pages.new_event.form.date_end')}</dt>
        <dd>{this.props.formData.endTime.format('LLL')}</dd>

        <dt>{this.props.translate('pages.new_event.form.description')}</dt>
        <dd>{this.props.formData.description}</dd>

        <dt>{this.props.translate('pages.new_event.form.source_url.label')}</dt>
        <dd>{this.props.formData.sourceUrls.join(', ')}</dd>

        <dt>{this.props.translate('pages.new_event.form.results.label')}</dt>
        <dd>
          <ul className="list-unstyled">
            {this.props.formData.results.map((result, key) => {
              return <li key={key}>
                {result.name}&nbsp;{result.coefficient}&nbsp;
              </li>
            }, this)}
          </ul>
        </dd>

        {this.state.gasLimit && <Fragment>
            <dt>{this.props.translate('pages.new_event.gas_limit')}</dt>
            <dd>{this.state.gasLimit}</dd>

            <dt>{this.props.translate('pages.new_event.gas_price')}</dt>
            <dd>{this.state.price}</dd>
          </Fragment>
        }
      </dl>
    </div>
  }

  _savedContent() {
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
          onClick: this.props.saveEvent
        }
      }];
    }

    return buttons;
  }

  render() {

    return(

      <main className='container'>
        <div>
          <BaseModal handleHideModal={this.props.modalClose} buttons={this._buttons()} title={ this.props.translate('pages.new_event.modal.submit')} >
            { this.props.saved ? this._savedContent() : this._confirmContent() }
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
    saved: state.newEvent.saved,
    save_error: state.newEvent.save_error,
    formData: state.newEvent.formData,
    translate: getTranslate(state.locale),
  };
}

const mapDispatchToProps = {
  modalClose: modalCloseEvent,
  saveEvent: modalSaveEvent
};

export default connect(mapPropsToState, mapDispatchToProps)(ModalConfirm);