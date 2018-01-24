import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { getMyBalance } from './../../util/token'
import { logout } from './../../util/auth';
import { logoutUser } from '../../actions/user';

class Wallet extends Component {
  constructor(props) {
    super(props);

    this.handleSuccessfulLogout = this.handleSuccessfulLogout.bind(this);
  }

  componentWillMount() {
    getMyBalance(this.props.web3).then((balance) => {
      this.setState({ balance: balance });
    });
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
        <li className="navbar-text">
          {this.props.balance !== null ? <span>Balance: {this.props.balance} TOSS</span> : 'Wallet info'}
        </li>
        <li className="navbar-text logout-button">
          { this.renderLogoutButton() }
        </li>
      </React.Fragment>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    balance: state.token.balance,
  };
}

export default withRouter(connect(mapPropsToState)(Wallet));
