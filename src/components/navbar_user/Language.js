import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router'
import { getActiveLanguage, setActiveLanguage, getLanguages, getTranslate } from 'react-localize-redux';

class Language extends Component {

  render() {
    return(
      <ul className="header__language">
        <li className="dropdown">
          <a href="" className="dropdown-toggle" data-toggle="dropdown">{this.props.translate('header.language')} <span className="caret"></span></a>
          <ul className="dropdown-menu" role="menu">
            { this.props.languages.map(language =>
              <li key={language.code}>
                <Link className="pure-menu-link"
                      to={this.props.location.pathname.replace(this.props.currentLanguage, language.code) + this.props.location.search}
                      onClick={ () => this.props.setActiveLanguage(language.code)}
                >
                  {this.props.translate('language.' + language.code)}
                </Link>
              </li>
            )}
          </ul>
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => ({
  languages: getLanguages(state.locale),
  currentLanguage: getActiveLanguage(state.locale).code,
  translate: getTranslate(state.locale)
});
const mapDispatchToProps = { setActiveLanguage };

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Language));
