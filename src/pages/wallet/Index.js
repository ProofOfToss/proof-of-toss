import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import TransactionsList from './TransactionsList'
import ModalDeposit from './ModalDeposit'
import ModalSend from "./../../components/wallet/ModalSend";
import { formatBalance } from './../../util/token'

class Index extends Component {
  constructor(props) {
    super(props)

    this.handleDepositShowModal = this.handleDepositShowModal.bind(this)
    this.handleDepositHideModal = this.handleDepositHideModal.bind(this)
    this.handleSendShowModal = this.handleSendShowModal.bind(this)
    this.handleSendHideModal = this.handleSendHideModal.bind(this)

    this.state = {
      view: {
        showDepositModal: false,
        showSendModal: false
      }
    }
  }

  handleDepositShowModal() {
    this.setState({view: {showDepositModal: true}})
  }

  handleDepositHideModal() {
    this.setState({view: {showDepositModal: false}})
  }

  handleSendShowModal() {
    this.setState({view: {showSendModal: true}})
  }

  handleSendHideModal() {
    this.setState({view: {showSendModal: false}})
  }

  render() {
    return(
      <main className="container wallet-index">
        <h1>TOSS</h1>
        <dl className="dl-horizontal">
          <dt>{ this.props.translate('pages.wallet.info.your_balance')}</dt>
          <dd>{ formatBalance(this.props.balance, this.props.decimals) }</dd>

          <dt>Block sum</dt>
          <dd>{ formatBalance(this.props.blockedBalance, this.props.decimals) }</dd>

          <dt />
          <dd>
            <button className="btn btn-primary" onClick={this.handleSendShowModal}>Send</button >
            <button className="btn btn-primary" onClick={this.handleDepositShowModal}>Deposit</button >
          </dd>
        </dl>

        <TransactionsList page={this.props.params.page} />

        {this.state.view.showDepositModal ? <ModalDeposit handleHideModal={this.handleDepositHideModal}/> : null}
        {this.state.view.showSendModal ? <ModalSend handleHideModal={this.handleSendHideModal} /> : null}
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    balance: state.token.balance,
    blockedBalance: state.token.blockedBalance,
    decimals: state.token.decimals,
    translate: getTranslate(state.locale)
  };
}

export default connect(mapPropsToState)(Index);
