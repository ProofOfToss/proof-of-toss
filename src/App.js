import React, { Component, Fragment } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import NavbarUser from './components/navbar_user/NavbarUser'
import Language from './components/navbar_user/Language'

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
        <li className={ this._menuLinkClass('/new_event') }><Link to="/new_event" className="pure-menu-link">New event</Link></li>
        <li className={ this._menuLinkClass('/wallet') }><Link to="/wallet" className="pure-menu-link">Wallet</Link></li>

        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown">Play <span className="caret"></span></a>
          <ul className="dropdown-menu" role="menu">
            <li><Link to="/play" className="pure-menu-link">Play</Link></li>
            <li><Link to="/play/event" className="pure-menu-link">Event</Link></li>
            <li><Link to="/play/event/bid_confirmation" className="pure-menu-link">Bid confirmation</Link></li>
            <li><Link to="/play/event/contest_result" className="pure-menu-link">Contest result</Link></li>
          </ul>
        </li>

        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown">Payments <span className="caret"></span></a>
          <ul className="dropdown-menu" role="menu">
            <li><Link to="/payments" className="pure-menu-link">Payments</Link></li>
            <li><Link to="/payments/withdraw" className="pure-menu-link">Withdraw payment</Link></li>
          </ul>
        </li>

        <li className={ this._menuLinkClass('/judge') }><Link to="/judge" className="pure-menu-link">Judge</Link></li>
      </ul>
    );
  }

  renderFooterMenu() {
    if (this.props.isAuthenticated === false) {
      return '';
    }

    return (
      <div className="row">

        <div className="col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/wallet" className="pure-menu-link">Wallet</Link></li>
            <li><Link to="/wallet/deposit" className="pure-menu-link">Deposit</Link></li>
            <li><Link to="/wallet/send" className="pure-menu-link">Send</Link></li>
          </ul>
        </div>

        <div className="col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/play" className="pure-menu-link">Play</Link></li>
            <li><Link to="/play/event" className="pure-menu-link">Event</Link></li>
            <li><Link to="/play/event/bid_confirmation" className="pure-menu-link">Bid confirmation</Link></li>
            <li><Link to="/play/event/contest_result" className="pure-menu-link">Contest result</Link></li>
          </ul>
        </div>

        <div className="col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/payments" className="pure-menu-link">Payments</Link></li>
            <li><Link to="/payments/withdraw" className="pure-menu-link">Withdraw payment</Link></li>
        </ul>
        </div>

        <div className="col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/judge" className="pure-menu-link">Judge</Link></li>
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
        </div>
      </Fragment>
    );
  }
}

function mapPropsToState(state) {
  return {
    isAuthenticated: state.user.isAuthenticated
  };
}

export default connect(mapPropsToState)(App);
