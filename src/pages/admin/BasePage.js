import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class BasePage extends Component {

  render() {
    if(!this.props.isWhitelisted) {
      return <div className="container">
        <h1>Access denied</h1>
      </div>
    }

    return(<div className="container">
        {this.props.content}
      </div>
    )
  }
}

function mapPropsToState(state) {
  return {
    translate: getTranslate(state.locale),
    isWhitelisted: state.user.isWhitelisted
  };
}

export default connect(mapPropsToState)(BasePage);
