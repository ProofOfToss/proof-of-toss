import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { getTranslate } from 'react-localize-redux';

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
        {this.props.translate('header.nav.logout')}
      </span>
    );
  }

  render() {
    return(
      <React.Fragment>
        <div className="header__address">
          {this.props.currentAddress}
        </div>
      </React.Fragment>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    balance: state.token.balance,
    translate: getTranslate(state.locale)
  };
}

export default withRouter(connect(mapPropsToState)(Wallet));
