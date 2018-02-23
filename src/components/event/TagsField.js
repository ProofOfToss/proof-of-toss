import React, { Component } from 'react';
import { connect } from 'react-redux';
import TagsInput from 'react-tagsinput'
import { getTranslate } from 'react-localize-redux';
import '../../styles/components/tags_input.scss'

class TagsField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {
        tags: []
      }
    }
  }

  _showErrors() {
    return this.state.formData.tags.length < 1 && this.props.showErrors;
  }

  render() {
    return <div className={"form-group" + (this._showErrors() ? ' has-error' : '')}>
      <label htmlFor="event[tags]">{ this.props.translate('pages.new_event.form.tags.label')}*</label>
      <TagsInput value={this.state.formData.tags} onChange={(tags) => {
        this.setState({
          formData: {
            tags: tags
          }
        });
        this.props.onChange({tags: tags})
      }} maxTags="10" className='react-tagsinput form-control' />
      { this._showErrors() &&
        <span id="helpBlock" className="help-block">{ this.props.translate('pages.new_event.form.tags.error') }</span>
      }
    </div>;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(TagsField);