import React, { Component, Fragment } from 'react'
import Link from './components/routing/Link'
import { connect } from 'react-redux';
import initLocale  from './components/locale/init'
import Header  from './components/navbar_user/Header';
import ModalWeb3LostConnection from './components/modal/ModalWeb3LostConnection'

global.jQuery = require("jquery");
require("bootstrap-sass");

// Styles
import './styles/App.scss'

class App extends Component {
  constructor(props) {
    super(props);
    this.renderFooterMenu = this.renderFooterMenu.bind(this);

    initLocale(props.dispatch, props.params.locale);
  }

  _menuLinkClass(path) {
    if (!this.props.location) {
      return '';
    }

    return this.props.location.pathname === path ? 'active' : '';
  }

  renderHeaderMenu() {
    if (this.props.isAuthenticated === false) {
      return '';
    }

    return (
      <ul className="nav navbar-nav">
        <li className={ this._menuLinkClass('/') }><Link to="/" className="pure-menu-link">Play</Link></li>
        <li className={ this._menuLinkClass('/wallet') }><Link to="/wallet" className="pure-menu-link">Wallet</Link></li>

        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown">Cabinet <span className="caret"></span></a>
          <ul className="dropdown-menu" role="menu">
            <li><Link to="/cabinet/my_bets" className="pure-menu-link">My bets</Link></li>
            <li><Link to="/cabinet/withdraw" className="pure-menu-link">Withdraw</Link></li>
          </ul>
        </li>

        <li className={ this._menuLinkClass('/faucet') }><Link to="/faucet" className="pure-menu-link">Faucet</Link></li>

        {
          this.props.isWhitelisted &&
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">Admin area <span className="caret"></span></a>
            <ul className="dropdown-menu" role="menu">
              <li className={ this._menuLinkClass('/admin/new_event') }><Link to="/admin/new_event" className="pure-menu-link">New event</Link></li>
              <li className={ this._menuLinkClass('/admin/event_results') }><Link to="/admin/event_results" className="pure-menu-link">Event results</Link></li>
            </ul>
          </li>
        }
      </ul>
    );
  }

  renderFooterMenu() {
    if (this.props.isAuthenticated === false) {
      return '';
    }

    return (
      <div className="row">

        <div className="col-xs-2 col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/" className="pure-menu-link">Play</Link></li>
          </ul>
        </div>

        <div className="col-xs-2 col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/wallet" className="pure-menu-link">Wallet</Link></li>
          </ul>
        </div>

        <div className="col-xs-2 col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/cabinet/my_bets" className="pure-menu-link">My bets</Link></li>
            <li><Link to="/cabinet/withdraw" className="pure-menu-link">Withdraw</Link></li>
          </ul>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        <div className="App">

          <Header />

          {this.props.children}

          <footer>
            <div className="container">
              { this.renderFooterMenu() }
              <hr />
              <div className="row copyright">
                <div className="col-md-6">
                  <a href="#">Terms of Service</a>
                  <a href="#">Privacy</a>
                  <a href="#">Security</a>
                </div>
                <div className="col-md-6">
                  <p className="muted pull-right">© 2017 Proof of toos. All rights reserved</p>
                </div>
              </div>
            </div>
          </footer>

          { this.props.web3HasConnection === false ? <ModalWeb3LostConnection /> : '' }
        </div>
      </Fragment>
    );
  }
}

function mapPropsToState(state) {
  return {
    isAuthenticated: state.user.isAuthenticated,
    web3HasConnection: state.web3.hasConnection,
    isWhitelisted: state.user.isWhitelisted,
  };
}

export default connect(mapPropsToState)(App);
