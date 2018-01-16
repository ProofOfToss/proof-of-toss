import React, { Component } from 'react'
import { connect } from 'react-redux';

import Wallet from '../wallet/Wallet'
import Guest from './Guest'

class NavbarUser extends Component {
  render() {
    let navbarUser = null;

    if (this.props.isAuthenticated) {
      navbarUser = <Wallet />
    } else {
      navbarUser = <Guest />
    }

    return(
      navbarUser
    )
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.user.isAuthenticated
  };
}

export default connect(mapStateToProps)(NavbarUser);
