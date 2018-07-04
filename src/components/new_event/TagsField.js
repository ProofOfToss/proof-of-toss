import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import TagsInput from 'react-tagsinput';
import Autosuggest from 'react-autosuggest';
import { getTranslate } from 'react-localize-redux';
import { fetchTags } from '../../util/tagsUtil';
import _ from "lodash";
import '../../styles/components/tags_input.scss'

class TagsField extends Component {
  constructor(props) {
    super(props);

    this.renderInput = this.renderInput.bind(this);
    this.onChangeTags = this.onChangeTags.bind(this);

    this.state = {
      formData: {
        tags: []
      },
      suggestions: []
    }
  }

  onChangeTags(tags) {
    this.setState({
      formData: {
        tags: tags
      },
      suggestions: []
    });

    this.props.onChange({tags: tags})
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.needToClear) {
      for (let i = 0; i < this.refs.tagsinput.props.value.length; i++) {
        this.refs.tagsinput.handleRemove(i);
      }

      this.setState({formData: {tags: []}});
    }
  }

  renderLayoutTags(tagComponents, inputComponent) {
    return (
      <Fragment>
        {tagComponents}
        {inputComponent}
      </Fragment>
    )
  }

  renderInput({addTag, ...props}) {

    const handleOnChange = (e, {newValue, method}) => {
      if (method === 'enter') {
        e.preventDefault()
      } else {

        fetchTags(this.props.esClient, newValue, this.props.locale).then((result) => {
          this.setState({
            suggestions: result
          })
        });

        props.onChange(e)
      }
    };

    return (
      <Autosuggest
        ref={props.ref}
        suggestions={this.state.suggestions}
        shouldRenderSuggestions={(value) => value && value.trim().length > 0}
        getSuggestionValue={(suggestion) => suggestion.name}
        renderSuggestion={(suggestion) => <span>{suggestion.name}</span>}
        inputProps={{
          ...props,
          onChange: handleOnChange,
          maxLength: 16,
          placeholder: this.props.translate('pages.new_event.form.tags.placeholder')
        }}
        onSuggestionSelected={(e, {suggestion}) => {
          addTag(suggestion.name)
        }}
        onSuggestionsClearRequested={() => {}}
        onSuggestionsFetchRequested={() => {}}
      />
    );
  }

  _showErrors() {
    return this.state.formData.tags.length < 1 && this.props.showErrors;
  }

  render() {
    return <div className={"form-group" + (this._showErrors() ? ' has-error' : '')}>
      <label htmlFor="event[tags]">{ this.props.translate('pages.new_event.form.tags.label')}*<br />
        <small>{this.props.translate('pages.new_event.form.tags.help')}</small>
      </label>
      <TagsInput ref="tagsinput"
                 value={this.state.formData.tags}
                 onChange={this.onChangeTags}
                 renderLayout={this.renderLayoutTags}
                 renderInput={this.renderInput}
                 onlyUnique={true}
                 maxTags="10"
                 addKeys={[9, 13, 32, ',']}
                 addOnBlur={true}
                 className='react б-tagsinput form-control'
      />
      { this._showErrors() &&
        <span id="helpBlock" className="help-block">{ this.props.translate('pages.new_event.form.tags.error') }</span>
      }
    </div>;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale),
    esClient: state.elastic.client,
    locale: _.find(state.locale.languages, (l) => l.active).code,
  };
}

export default connect(mapStateToProps)(TagsField);