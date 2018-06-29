import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import Link from '../routing/Link'
import { getTranslate } from 'react-localize-redux';
import { logout } from './../../util/auth';
import { logoutUser } from '../../actions/user';
import NavbarUser from './NavbarUser';
import Language from './Language';

class Header extends Component {

  constructor(props) {
    super(props);

    this._menuLinkClass = this._menuLinkClass.bind(this);
    this.renderHeaderMenu = this.renderHeaderMenu.bind(this);
    this.handleSuccessfulLogout = this.handleSuccessfulLogout.bind(this);
  }

  _menuLinkClass(path) {
    if (!this.props.location) {
      return '';
    }

    return this.props.location.pathname === path ? 'active' : '';
  }


  handleSuccessfulLogout() {
    this.props.dispatch(logoutUser());
    this.props.router.push("/sign-in");
  }

  renderHeaderMenu() {
    if (this.props.isAuthenticated === false) {
      return '';
    }

    return (
      <ul>
        <li className={ 'selected ' + this._menuLinkClass('/') }>
          <Link to="/" className="pure-menu-link">{this.props.translate('header.nav.play')}</Link>
        </li>
        <li className={ this._menuLinkClass('/wallet') }>
          <Link to="/wallet" className="pure-menu-link">{this.props.translate('header.nav.wallet')}</Link>
        </li>

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
      <header className="header">
        <Link to="/" className="header__logo">
          <img src="/img/logo.png" alt="ProofOfToss" />
        </Link>

        <nav className="header__nav">
          { this.renderHeaderMenu() }
        </nav>

        <Language />

        <NavbarUser />

        <div className="header__menu header__menu_dropdown">
          <span className="icon icon-menu" />
          <ul className="header__menu-dropdown" onClick={ () => { logout(this.props.currentAddress, this.handleSuccessfulLogout) } }>
            <li className="header__menu-dropdown-item">{this.props.translate('header.nav.logout')}</li>
          </ul>
        </div>

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

export default withRouter(connect(mapStateToProps)(Header));
