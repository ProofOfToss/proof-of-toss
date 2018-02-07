import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { setActiveLanguage, getLanguages } from 'react-localize-redux';

class Language extends Component {

  render() {
    return(
      <li className="dropdown">
        <a href="#" className="dropdown-toggle" data-toggle="dropdown">Language <span className="caret"></span></a>
        <ul className="dropdown-menu" role="menu">
          { this.props.languages.map(language =>
            <li key={language.code}><Link className="pure-menu-link" onClick={ () => this.props.setActiveLanguage(language.code)}>{language.name}</Link></li>
          )}
        </ul>
      </li>
    )
  }
}

const mapStateToProps = state => ({ languages: getLanguages(state.locale) });
const mapDispatchToProps = { setActiveLanguage };

export default connect(mapStateToProps, mapDispatchToProps)(Language);
