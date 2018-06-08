import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import BaseModal from './BaseModal'

class ModalWeb3LostConnection extends Component {
  render() {
    return(
      <BaseModal handleHideModal={this.props.handleHideModal} buttons={[
        {title: this.props.translate('buttons.close'), className: 'btn-default', attrs: {'data-dismiss': 'modal'}}
      ]}>
        <div className="alert alert-danger" role="alert">
          {this.props.translate('web3_lost_connection')}
        </div>
      </BaseModal>
    )
  }
}

const mapStateToProps = state => ({
  translate: getTranslate(state.locale)
});

export default connect(mapStateToProps)(ModalWeb3LostConnection);
