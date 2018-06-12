import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import { formatBalance } from './../../util/token'

class TransactionItem extends Component {
  render() {

    const type = this.props.currentAddress === this.props.item.to ? this.props.translate('pages.wallet.transactions_list.type_in') : this.props.translate('pages.wallet.transactions_list.type_out');
    const wallet = this.props.currentAddress === this.props.item.to ? this.props.item.from : this.props.item.to

    return(
      <tr>
        <td>{this.props.item.time.toLocaleDateString()} {this.props.item.time.toLocaleTimeString()}</td>
        <td>{type}</td>
        <td>{wallet}</td>
        <td>{ formatBalance(this.props.item.sum, this.props.decimals) }</td>
        <td>{this.props.item.fee}</td>
      </tr>
    )
  }
}

function mapPropsToState(state) {
  return {
    currentAddress: state.web3.currentAddress,
    decimals: state.token.decimals,
    translate: getTranslate(state.locale)
  };
}

export default connect(mapPropsToState)(TransactionItem);
