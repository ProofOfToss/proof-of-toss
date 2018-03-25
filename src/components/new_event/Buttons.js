import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class Buttons extends Component {
  render() {
    return <Fragment>
      <button type="submit" className="btn btn-default">
        { this.props.translate('pages.new_event.form.submit')}
      </button>
    </Fragment>;
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(Buttons);
