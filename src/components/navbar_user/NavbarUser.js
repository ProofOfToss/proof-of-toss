import React, { Component } from 'react'

import Wallet from '../wallet/Wallet'
import Guest from './Guest'

class NavbarUser extends Component {

  constructor(props) {
    super(props);
    this.state = { isLoggedIn: true };
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn;

    let navbarUser = null;
    if(isLoggedIn) {
      navbarUser = <Wallet />
    } else {
      navbarUser = <Guest />
    }

    return(
      navbarUser
    )
  }
}

export default NavbarUser
