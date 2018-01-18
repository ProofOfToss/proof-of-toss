import React, { Component } from 'react'
import BaseModal from './BaseModal'

class ModalWeb3LostConnection extends Component {
  render() {
    return(
      <BaseModal handleHideModal={this.props.handleHideModal} buttons={[
        {title: 'Close', className: 'btn-default', attrs: {'data-dismiss': 'modal'}}
      ]}>
        <div className="alert alert-danger" role="alert">
            You have no connection with RPC server. Please check that MetaMask is connected to one of the RPC servers.
        </div>
      </BaseModal>
    )
  }
}

export default ModalWeb3LostConnection
