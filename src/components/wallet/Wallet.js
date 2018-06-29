import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { getTranslate } from 'react-localize-redux';
import { logout } from './../../util/auth';
import { logoutUser } from '../../actions/user';


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
          <span className="icon icon-wallet" />
          <span className="header__address-text">{this.props.currentAddress}</span>
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
