import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class SourceUrl extends Component {

  render() {
    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
    const regex = new RegExp(expression);

    return <dl className="dl-horizontal">
      <dt>{this.props.translate('pages.event.labels.source_url')}</dt>
      <dd>
        <ul className="list-unstyled">
          {this.props.sourceUrl.split(',').map((sourceUrl, key) => {
            if (sourceUrl.match(regex)) {
              return <li key={key}><a href={sourceUrl} target="_blank">{sourceUrl}</a></li>
            }

            return <li key={key}>{sourceUrl}</li>
          })
          }
        </ul>
      </dd>
    </dl>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  }
}

export default connect(mapStateToProps)(SourceUrl);