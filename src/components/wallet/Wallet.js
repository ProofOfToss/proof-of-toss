import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { formatBalance } from './../../util/token'
import { logout } from './../../util/auth';
import { logoutUser } from '../../actions/user';
import config from '../../data/config.json'

class Wallet extends Component {
  constructor(props) {
    super(props);

    this.handleSuccessfulLogout = this.handleSuccessfulLogout.bind(this);
  }

  handleSuccessfulLogout() {
    this.props.dispatch(logoutUser());
    this.props.router.push("/sign-in");
  }

  renderLogoutButton() {
    return (
      <span onClick={ () => { logout(this.props.currentAddress, this.handleSuccessfulLogout) } }>
        Logout
      </span>
    );
  }

  render() {
    return(
      <React.Fragment>
        <p className="navbar-text address">
          {this.props.currentAddress}
        </p>
        <p className="navbar-text">
          {this.props.balance !== null ? <span title={ formatBalance(this.props.balance, config.view.token_precision) + " TOSS" }>Balance: {formatBalance(this.props.balance)} TOSS</span> : 'Wallet info'}
        </p>
        <p className="navbar-text logout-button">
          { this.renderLogoutButton() }
        </p>
      </React.Fragment>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    balance: state.token.balance
  };
}

export default withRouter(connect(mapPropsToState)(Wallet));
