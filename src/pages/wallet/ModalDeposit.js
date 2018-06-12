import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import QRCode from 'qrcode'
import BaseModal from '../../components/modal/BaseModal'

class ModalDeposit extends Component {

  constructor(props) {
    super(props)
    this.state = {
      addressQRCode: null
    };
  }

  componentDidMount() {
    QRCode.toDataURL(this.props.currentAddress)
      .then(url => {
        this.setState({
          addressQRCode: url
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render() {

    const buttons = [{
      title: this.props.translate('pages.wallet.deposit.cancel'),
      className: 'btn-default',
      attrs: {
        'data-dismiss': 'modal'
      }
    }]

    return(
      <BaseModal handleHideModal={this.props.handleHideModal} buttons={buttons} title={this.props.translate('pages.wallet.deposit.modal_title')}>
        <p>{this.props.translate('pages.wallet.deposit.instruction')}</p>
        <p>{this.props.translate('pages.wallet.deposit.address')}: {this.props.currentAddress}</p>
        <p><img src={this.state.addressQRCode} alt="" /></p>
      </BaseModal>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    translate: getTranslate(state.locale)
  };
}

export default connect(mapPropsToState)(ModalDeposit)
