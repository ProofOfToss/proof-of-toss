import React, { Component } from 'react'
import { connect } from 'react-redux';

class TransactionItem extends Component {
  render() {

    const type = this.props.currentAddress === this.props.item.to ? 'in' : 'out';
    const wallet = this.props.currentAddress === this.props.item.to ? this.props.item.from : this.props.item.to

    return(
      <tr>
        <td>{this.props.item.time.toLocaleDateString()} {this.props.item.time.toLocaleTimeString()}</td>
        <td>{type}</td>
        <td>{wallet}</td>
        <td>{this.props.item.sum}</td>
        <td>{this.props.item.fee}</td>
      </tr>
    )
  }
}

function mapPropsToState(state) {
  return {
    currentAddress: state.web3.currentAddress
  };
}

export default connect(mapPropsToState)(TransactionItem);
