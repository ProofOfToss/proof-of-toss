import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getTranslate } from 'react-localize-redux'

class Home extends Component {
  render() {
    return(
      <main className="container">
        <div>
          <h1>{ this.props.translate('pages.home.title') }</h1>
          <p>Your Truffle Box is installed and ready.</p>
        </div>
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale),
  };
}

export default connect(mapStateToProps)(Home);
