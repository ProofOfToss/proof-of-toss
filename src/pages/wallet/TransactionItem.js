import React, { Component } from 'react'

class TransactionItem extends Component {
  render() {
    return(
      <tr>
        <td>{this.props.item.time.toLocaleDateString()} {this.props.item.time.toLocaleTimeString()}</td>
        <td>{this.props.item.type}</td>
        <td>{this.props.item.walletNumber}</td>
        <td>{this.props.item.sum}</td>
        <td>{this.props.item.fee}</td>
      </tr>
    )
  }
}

export default TransactionItem
