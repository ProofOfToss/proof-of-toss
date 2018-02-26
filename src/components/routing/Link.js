import React, { Component } from 'react'
import { Link as ReactRouterLink, withRouter } from 'react-router'
import config from "../../data/config.json"

class Link extends Component {
  render() {
    let paramLocale = this.props.params.locale;

    if(paramLocale === undefined) {
      paramLocale = config.languages.list[0].code;
    }

    const to = `/${paramLocale}${this.props.to}`;
    return <ReactRouterLink to={to} className={this.props.className} onlyActiveOnIndex={false}>
      {this.props.children}
    </ReactRouterLink>
  }
}

export default withRouter(Link);