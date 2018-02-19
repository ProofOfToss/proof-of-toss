import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Select } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import config from "../../data/config.json"

class LanguageField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {
        language: null
      },
      languages: []
    }
  }

  componentDidMount() {
    this.setState({
      languages: config.languages.list,
      formData: {
        language: config.languages.list[0].code
      }
    });
  }

  render() {
    const languageLink = Link.state(this, 'formData').at('language')
      .check( v => v, this.props.translate('validation.required'))
    ;

    return <div className={"form-group" + (languageLink.error ? ' has-error' : '')}>
        <label htmlFor="event[language]">{ this.props.translate('pages.new_event.form.language')}*</label>
        {this.state.languages.length > 0 &&
          <Select valueLink={languageLink} type='text' id="event[language]" className='form-control'
                  value={this.state.formData.language}>
            {this.state.languages.map((language) => {
              return <option key={language.code} value={language.code}>{language.name}</option>
            }, this)}
          </Select>
        }
        <span id="helpBlock" className="help-block">{ languageLink.error || '' }</span>
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