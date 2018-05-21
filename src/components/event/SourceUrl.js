import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class SourceUrl extends Component {

  renderUrl() {
    var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    var regex = new RegExp(expression);

    if (this.props.sourceUrl.match(regex)) {
      return <a href={this.props.sourceUrl} target="_blank">{this.props.sourceUrl}</a>
    }

    return this.props.sourceUrl
  }

  render() {
    return <dl className="dl-horizontal">
      <dt>{this.props.translate('pages.event.labels.source_url')}</dt>
      <dd>{this.renderUrl()}</dd>
    </dl>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  }
}

export default connect(mapStateToProps)(SourceUrl);