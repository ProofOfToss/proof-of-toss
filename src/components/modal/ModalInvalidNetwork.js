import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import BaseModal from './BaseModal'

class ModalInvalidNetwork extends Component {
  render() {
    return(
      <BaseModal handleHideModal={this.props.handleHideModal} buttons={[]} title="" hideCloseBtn={true} staticBackdrop={true}>
        <div className="alert alert-danger" role="alert">
          {this.props.translate('web3_invalid_network')}
        </div>
      </BaseModal>
    )
  }
}

const mapStateToProps = state => ({
  translate: getTranslate(state.locale)
});

export default connect(mapStateToProps)(ModalInvalidNetwork);
