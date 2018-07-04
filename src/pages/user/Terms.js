import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { getTranslate } from 'react-localize-redux';
import '../../styles/pages/login.scss';

class Terms extends Component {
  render() {
    return(
      <main className="container login">
        <div>
          <h1>{this.props.translate('pages.terms_and_conditions.header')}</h1>
          <p>{this.props.translate('pages.terms_and_conditions.body')}</p>
        </div>
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    translate: getTranslate(state.locale),
  };
}

export default withRouter(connect(mapPropsToState)(Terms));
