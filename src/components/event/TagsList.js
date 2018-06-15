import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class TagsList extends Component {

  render() {
    return <div className="event__tags">
      <dl className="dl-horizontal">
        <dt>{this.props.translate('pages.event.labels.tags')}</dt>
        <dd>
          {this.props.tags.map((tag, key) => {
            return <span className="label label-primary" key={key}>{tag.name}</span>
          }, this)}
        </dd>
      </dl>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  }
}

export default connect(mapStateToProps)(TagsList);