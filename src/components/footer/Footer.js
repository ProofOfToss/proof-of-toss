import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '../routing/Link'
import { getTranslate } from 'react-localize-redux';

class Footer extends Component {

  constructor(props) {
    super(props);

    this.renderFooterMenu = this.renderFooterMenu.bind(this);
    this.state = {
      currentYear: (new Date()).getFullYear()
    };
  }

  renderFooterMenu() {
    if (this.props.isAuthenticated === false) {
      return '';
    }

    return (
      <div className="row">

        <div className="col-xs-2 col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/" className="pure-menu-link">{this.props.translate('footer.nav.play')}</Link></li>
          </ul>
        </div>

        <div className="col-xs-2 col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/wallet" className="pure-menu-link">{this.props.translate('footer.nav.wallet')}</Link></li>
          </ul>
        </div>

        <div className="col-xs-2 col-md-2">
          <ul className="list-unstyled" role="menu">
            <li><Link to="/cabinet/my_bets" className="pure-menu-link">{this.props.translate('footer.nav.my_bets')}</Link></li>
            <li><Link to="/cabinet/withdraw" className="pure-menu-link">{this.props.translate('footer.nav.withdraw')}</Link></li>
          </ul>
        </div>
      </div>
    );
  }

  render() {
    return (
      <footer className="footer">
        <div className="footer__logo">
          <img className="footer__logo-img" src="/img/logo.png" alt="ProofOfToss" />
        </div>

        <div className="footer__nav">
          <Link className="footer__nav_link" to="/terms_and_conditions">{this.props.translate('footer.terms_conditions')}</Link>
          <a className="footer__nav_link" href="https://toss.pro/privacy-policy" target="_blank">{this.props.translate('footer.privacy')}</a>
          <a className="footer__nav_link" href="https://toss.pro" target="_blank">{this.props.translate('footer.about')}</a>
        </div>

        <div className="footer__copyright">
          {this.props.translate('footer.copyright', {year: this.state.currentYear})}
        </div>
      </footer>
    )
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated,
  translate: getTranslate(state.locale)
});

export default connect(mapStateToProps)(Footer);
