import React, { Component } from 'react'
import { Link } from 'react-router'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
        <Link to="/" className="pure-menu-heading pure-menu-link">Truffle Box</Link>
          <ul className="pure-menu-list navbar-right">
            <li className="pure-menu-item">
              <Link to="/storage" className="pure-menu-link">StorageSC test</Link>
            </li>
            <li className="pure-menu-item">
              <Link to="/events" className="pure-menu-link">Events list</Link>
            </li>
            <li className="pure-menu-item">
              <Link to="/new_event" className="pure-menu-link">New event</Link>
            </li>
          </ul>
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App
