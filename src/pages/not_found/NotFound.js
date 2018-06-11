import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { getTranslate } from 'react-localize-redux';

class NotFound extends React.Component {
    render() {
        return (
          <main className="container">
            <div>
              <h1>{this.props.translate('notfound.error')}</h1>
              <p>{this.props.translate('notfound.message')}</p>
            </div>
          </main>
        );
    }
};

function mapPropsToState(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default withRouter(connect(mapPropsToState)(NotFound));
