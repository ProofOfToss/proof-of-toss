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
      showSourceUrlErrors: false,
      sourceUrls: ['Source url']
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.saved) {
      this.setState({
        sourceUrls: []
      });
    }
  }

  addSourceUrl() {
    if(this.sourceUrlLink.error !== undefined) {
      this.setState({
        showSourceUrlErrors: true
      });
      return;
    }

    const sourceUrls = [...this.state.sourceUrls, this.state.sourceUrl];

    this.setState({
      sourceUrl: '',
      showSourceUrlErrors: false,
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
    this.sourceUrlLink = Link.state(this, 'sourceUrl')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}))
    ;

    return <Fragment>
      <div className="form-group">
        <label htmlFor="event[source_url]">{ this.props.translate('pages.new_event.form.source_url.label')}*</label>
        <ul>
          {this.state.sourceUrls.map((sourceUrl, key) => {
            return <li key={key}>
              {sourceUrl}&nbsp;
              <a className="btn btn-default btn-xs" onClick={() => {this.removeSourceUrl(key)}}>
                { this.props.translate('pages.new_event.form.source_url.remove')}
              </a>
            </li>
          }, this)}
        </ul>
        <div className="row">
          <div className={"col-xs-8" + (this.sourceUrlLink.error && this.state.showSourceUrlErrors ? ' has-error' : '')}>
            <Input valueLink={ this.sourceUrlLink } type='text' id="event[source_url]" className='form-control' />
            {this.sourceUrlLink.error && this.state.showSourceUrlErrors &&
              <span id="helpBlock" className="help-block">{ this.sourceUrlLink.error || '' }</span>
            }
          </div>
          <div className="col-xs-4">
            <a className="btn btn-default" onClick={this.addSourceUrl}>{ this.props.translate('pages.new_event.form.source_url.add_new')}</a>
          </div>
        </div>
        {this.state.sourceUrls.length < 1 && this.props.showErrors &&
          <div className={this.state.sourceUrls < 1 && this.props.showErrors ? ' has-error' : ''}>
            <span id="helpBlock" className="help-block">{ this.props.translate('pages.new_event.form.source_url.error')}</span>
          </div>
        }
      </div>
    </Fragment>
    ;
  }
}

function mapStateToProps(state) {
  return {
    saved: state.newEvent.saved,
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(SourceUrlField);