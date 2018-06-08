import React, { Component } from 'react';
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
        <li className={ this._menuLinkClass('/') }><Link to="/" className="pure-menu-link">{this.props.translate('header.nav.play')}</Link></li>
        <li className={ this._menuLinkClass('/wallet') }><Link to="/wallet" className="pure-menu-link">{this.props.translate('header.nav.wallet')}</Link></li>

        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown">{this.props.translate('header.nav.cabinet')} <span className="caret"></span></a>
          <ul className="dropdown-menu" role="menu">
            <li><Link to="/cabinet/my_bets" className="pure-menu-link">{this.props.translate('header.nav.cabinet_my_bets')}</Link></li>
            <li><Link to="/cabinet/withdraw" className="pure-menu-link">{this.props.translate('header.nav.cabinet_withdraw')}</Link></li>
          </ul>
        </li>

        <li className={ this._menuLinkClass('/faucet') }><Link to="/faucet" className="pure-menu-link">{this.props.translate('header.nav.faucet')}</Link></li>

        {
          this.props.isWhitelisted &&
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">{this.props.translate('header.nav.admin_area')} <span className="caret"></span></a>
            <ul className="dropdown-menu" role="menu">
              <li className={ this._menuLinkClass('/admin/new_event') }><Link to="/admin/new_event" className="pure-menu-link">{this.props.translate('header.nav.admin_area_new_event')}</Link></li>
              <li className={ this._menuLinkClass('/admin/event_results') }><Link to="/admin/event_results" className="pure-menu-link">{this.props.translate('header.nav.admin_area_event_results')}</Link></li>
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
                <span className="sr-only">{this.props.translate('header.nav.toggle_navigation')}</span>
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <Link to="/" className="navbar-brand">{this.props.translate('header.nav.proof_of_toss')}</Link>
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
