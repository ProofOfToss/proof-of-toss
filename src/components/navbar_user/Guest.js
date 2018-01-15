import React, { Component, Fragment } from 'react'
import { Link } from 'react-router'

class Guest extends Component {

  render() {
    return (
      <Fragment>
        <li><Link to='/register' className='pure-menu-link'>Register</Link></li>
        <li><Link to='/login' className='pure-menu-link'>Login</Link></li>
      </Fragment>
    )
  }
}

export default Guest
