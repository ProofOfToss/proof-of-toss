import React, { Component } from 'react'
import { Link } from 'react-router'

class Language extends Component {

  render() {
    return(
      <li className="dropdown">
        <a href="#" className="dropdown-toggle" data-toggle="dropdown">Language <span className="caret"></span></a>
        <ul className="dropdown-menu" role="menu">
          <li><Link to="#" className="pure-menu-link">English</Link></li>
          <li><Link to="#" className="pure-menu-link">Russian</Link></li>
        </ul>
      </li>
    )
  }
}

export default Language
