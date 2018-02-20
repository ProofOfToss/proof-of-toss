import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Input } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';

class SourceUrlField extends Component {
  constructor(props) {
    super(props);

    this.addSourceUrl = this.addSourceUrl.bind(this);
    this.removeSourceUrl = this.removeSourceUrl.bind(this);

    this.state = {
      sourceUrl: '',
      sourceUrls: []
    }
  }

  addSourceUrl() {
    const sourceUrls = [...this.state.sourceUrls, this.state.sourceUrl];

    this.setState({
      sourceUrls: sourceUrls
    });

    this.props.onChange({sourceUrls: sourceUrls})
  }

  removeSourceUrl(key) {
    const sourceUrls = this.state.sourceUrls;
    sourceUrls.splice(key, 1);
    this.setState({
      sourceUrls: sourceUrls
    });

    this.props.onChange({sourceUrls: sourceUrls});
  }

  render() {
    const sourceUrlLink = Link.state(this, 'sourceUrl')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}))
    ;

    return <Fragment>
      <div className={"form-group" + (sourceUrlLink.error ? ' has-error' : '')}>
        <label htmlFor="event[source_url]">{ this.props.translate('pages.new_event.form.source_url')}*</label>
        <ul>
          {this.state.sourceUrls.map((sourceUrl, key) => {
            return <li key={key}>
              {sourceUrl}&nbsp;
              <a className="btn btn-default btn-xs" onClick={() => {this.removeSourceUrl(key)}}>
                { this.props.translate('pages.new_event.form.source_url_remove')}
              </a>
            </li>
          }, this)}
        </ul>
        <div className="row">
          <div className="col-xs-8">
            <Input valueLink={ sourceUrlLink } type='text' id="event[source_url]" className='form-control' />
          </div>
          <div className="col-xs-4">
            <a className="btn btn-default" onClick={this.addSourceUrl}>{ this.props.translate('pages.new_event.form.source_url_add_new')}</a>
          </div>
        </div>
        <span id="helpBlock" className="help-block">{ sourceUrlLink.error || '' }</span>
      </div>
    </Fragment>
    ;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(SourceUrlField);