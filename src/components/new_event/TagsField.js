import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import TagsInput from 'react-tagsinput'
import { getTranslate } from 'react-localize-redux';
import '../../styles/components/tags_input.scss'

class TagsField extends Component {
  constructor(props) {
    super(props);

    this.onChangeTags = this.onChangeTags.bind(this);

    this.state = {
      formData: {
        tags: []
      }
    }
  }

  onChangeTags(tags) {
    this.setState({
      formData: {
        tags: tags
      }
    });
    this.props.onChange({tags: tags})
  }

  renderLayoutTags(tagComponents, inputComponent) {
    return (
      <Fragment>
        {tagComponents}
        {inputComponent}
      </Fragment>
    )
  }

  renderInput(props) {
    let {onChange, value, ...other} = props;
    delete other.addTag;
    return (
      <input type='text' onChange={onChange} value={value} maxLength="16" {...other} />
    )
  }

  _showErrors() {
    return this.state.formData.tags.length < 1 && this.props.showErrors;
  }

  render() {
    return <div className={"form-group" + (this._showErrors() ? ' has-error' : '')}>
      <label htmlFor="event[tags]">{ this.props.translate('pages.new_event.form.tags.label')}*</label>
      <TagsInput value={this.state.formData.tags} onChange={this.onChangeTags} renderLayout={this.renderLayoutTags}
                 renderInput={this.renderInput} onlyUnique={true}
                 maxTags="10" className='react-tagsinput form-control' />
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