import React, { Component, Fragment } from 'react'
import Link from './components/routing/Link'
import { connect } from 'react-redux';
import initLocale  from './components/locale/init'
import NavbarUser from './components/navbar_user/NavbarUser'
import Language from './components/navbar_user/Language'
import ModalWeb3LostConnection from './components/modal/ModalWeb3LostConnection'

global.jQuery = require("jquery");
require("bootstrap-sass");

// Styles
import './styles/App.scss'

class App extends Component {
  constructor(props) {
    super(props);

    this._menuLinkClass = this._menuLinkClass.bind(this);
    this.renderHeaderMenu = this.renderHeaderMenu.bind(this);
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
          <nav className="navbar navbar-default">
            <div className="container-fluid">
              { /* Brand and toggle get grouped for better mobile display */ }
              <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                  <span className="icon-bar" />
                </button>
                <Link to="/" className="navbar-brand">Proof of toss</Link>
              </div>

              { /* Collect the nav links, forms, and other content for toggling */ }
              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                { this.renderHeaderMenu() }

                <ul className="nav navbar-nav navbar-right">
                  <NavbarUser />
                  <Language />
                </ul>

              </div>{ /* /.navbar-collapse */ }
            </div>{ /* /.container-fluid */ }
          </nav>

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
