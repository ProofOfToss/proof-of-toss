import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getMyBalance } from './../../util/token'

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = { balance: null };
  }

  componentWillMount() {
    getMyBalance(this.props.web3).then((balance) => {
      this.setState({ balance: balance });
    });
  }

  render() {
    return(
      <li className="navbar-text">
        {this.state.balance !== null ? <span>Balance: {this.state.balance} TOSS</span> : 'Wallet info'}
      </li>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3
  };
}

export default connect(mapPropsToState)(Wallet);
