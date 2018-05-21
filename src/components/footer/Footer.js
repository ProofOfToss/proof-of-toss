import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '../routing/Link'
import { getTranslate } from 'react-localize-redux';

class Footer extends Component {

  constructor(props) {
    super(props);

    this.renderFooterMenu = this.renderFooterMenu.bind(this);
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
      <footer>
        <div className="container">
          { this.renderFooterMenu() }
          <hr />
          <div className="row copyright">
            <div className="col-md-6">
              <a href="https://toss.pro/terms-and-conditions" target="_blank">{this.props.translate('footer.terms_conditions')}</a>
              <a href="https://toss.pro/privacy-policy" target="_blank">{this.props.translate('footer.privacy')}</a>
              <a href="https://toss.pro" target="_blank">{this.props.translate('footer.about')}</a>
            </div>
            <div className="col-md-6">
              <p className="muted pull-right">© 2017 Proof of toos. All rights reserved</p>
            </div>
          </div>
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
