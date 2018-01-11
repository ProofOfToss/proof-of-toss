import React, { Component } from 'react'
import { Link } from 'react-router'

global.jQuery = require("jquery");
require("bootstrap-sass");

// Styles
import './styles/App.scss'
import Wallet from './components/wallet/Wallet'

class App extends Component {
  constructor(props) {
    super(props);

    this._menuLinkClass = this._menuLinkClass.bind(this);
  }

  _menuLinkClass(path) {
    if (!this.props.location) {
      return '';
    }

    return this.props.location.pathname == path ? 'active' : '';
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            { /* Brand and toggle get grouped for better mobile display */ }
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <Link to="/" className="navbar-brand">Proof of toss</Link>
            </div>

            { /* Collect the nav links, forms, and other content for toggling */ }
            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul className="nav navbar-nav">
                <li className={ this._menuLinkClass('/storage') }><Link to="/storage" className="pure-menu-link">StorageSC test</Link></li>
                <li className={ this._menuLinkClass('/events') }><Link to="/events" className="pure-menu-link">Events list</Link></li>
                <li className={ this._menuLinkClass('/new_event') }><Link to="/new_event" className="pure-menu-link">New event</Link></li>
              </ul>

              <div className="navbar-text navbar-right"><Wallet/></div>
            </div>{ /* /.navbar-collapse */ }
          </div>{ /* /.container-fluid */ }
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App
