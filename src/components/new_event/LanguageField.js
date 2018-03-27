import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Select } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import config from "../../data/config.json";

class LanguageField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      languages: config.languages.list
    }
  }

  render() {

    return <div className={"form-group" + (this.props.valueLink.error ? ' has-error' : '')}>
        <label htmlFor="event[language]">{ this.props.translate('pages.new_event.form.language')}*</label>
        {this.state.languages.length > 0 &&
          <Select valueLink={this.props.valueLink} type='text' id="event[language]" className='form-control'>
            {this.state.languages.map((language) => {
              return <option key={language.code} value={language.code}>{language.name}</option>
            }, this)}
          </Select>
        }
        <span id="helpBlock" className="help-block">{ this.props.valueLink.error || '' }</span>
      </div>
    ;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(LanguageField);