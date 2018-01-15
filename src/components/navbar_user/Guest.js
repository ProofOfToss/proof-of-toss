import React, { Component } from 'react'
import { Link } from 'react-router'

class Login extends Component {

  render() {
    return(
      <React.Fragment>
        <li><Link to="/register" className="pure-menu-link">Register</Link></li>
        <li><Link to="/login" className="pure-menu-link">Login</Link></li>
      </React.Fragment>
    )
  }
}

export default Login
