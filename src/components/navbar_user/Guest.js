import React, { Component, Fragment } from 'react'
import { Link } from 'react-router'

class Guest extends Component {

  render() {
    return (
      <Fragment>
        <li><Link to='/sign-in' className='pure-menu-link'>Sign in</Link></li>
      </Fragment>
    )
  }
}

export default Guest
