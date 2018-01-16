import React, { Component } from 'react'
import BaseModal from '../../components/modal/BaseModal'

class ConfirmResult extends Component {

  render() {
    return(
      <BaseModal handleHideModal={this.props.handleHideModal}>
        <p>Modal confirm result body</p>
      </BaseModal>
    )
  }
}

export default ConfirmResult
