import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from '../routing/Link'
import { getTranslate } from 'react-localize-redux';
import NavbarUser from './NavbarUser';
import Language from './Language';

class Header extends Component {

  constructor(props) {
    super(props);

    this._menuLinkClass = this._menuLinkClass.bind(this);
    this.renderHeaderMenu = this.renderHeaderMenu.bind(this);
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

  render() {
    return (
      <header>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <Link to="/" className="navbar-brand">Proof of toss</Link>
            </div>

            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              { this.renderHeaderMenu() }

              <div className="navbar-right">
                <NavbarUser />
                <ul className="nav navbar-nav navbar-right">
                  <Language />
                </ul>
              </div>

            </div>
          </div>
          <div className=""></div>
        </nav>

        {this.props.isAuthenticated &&
          <div className="container-fluid address">{this.props.translate('header.address')}: {this.props.currentAddress}</div>
        }
      </header>
    )
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated,
  translate: getTranslate(state.locale),
  currentAddress: state.user.address,
  isWhitelisted: state.user.isWhitelisted,
});

export default connect(mapStateToProps)(Header);
