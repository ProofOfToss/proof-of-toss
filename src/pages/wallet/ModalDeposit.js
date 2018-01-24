import React, { Component } from 'react'
import { connect } from 'react-redux';
import QRCode from 'qrcode'
import BaseModal from '../../components/modal/BaseModal'
import { strings } from '../../util/i18n';

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
      title: 'Cancel',
      className: 'btn-default',
      attrs: {
        'data-dismiss': 'modal'
      }
    }]

    return(
      <BaseModal handleHideModal={this.props.handleHideModal} buttons={buttons} title={strings().deposit.modal_title}>
        <p>{strings().deposit.instruction}</p>
        <p>{strings().deposit.address}: {this.props.currentAddress}</p>
        <p><img src={this.state.addressQRCode} alt="" /></p>
      </BaseModal>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address
  };
}

export default connect(mapPropsToState)(ModalDeposit)
