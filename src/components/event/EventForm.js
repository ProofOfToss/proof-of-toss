import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link/*, { LinkedComponent }*/ from 'valuelink'
import { Input, TextArea/*, Select, Radio, Checkbox*/ } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import TagsInput from 'react-tagsinput'
import LanguageField from './LanguageField'
import CategoriesField from './CategoryField'
import DateFields from './DateFields'
import SourceUrlField from './SourceUrlField'
import ResultsField from './ResultsField'
import 'react-tagsinput/react-tagsinput.css'
import { saveEvent } from '../../actions/pages/newEvent'

class EventForm extends Component {
  constructor(props) {
    super(props);

    this.handleTagsChange = this.handleTagsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      saving: false,
      categories: [],
      formData: {
        category: '',
        name: 'test-' + (Math.random()),
        bidType: '',
        deposit: null,
        tags: ['testTag'],
        description: ''
      }
    }
  }

  handleTagsChange(tags) {
    this.setState({
      tags: tags
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.saveEvent(this.state.formData);
  }

  render() {
    const nameLink = Link.state(this, 'formData').at('name')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    const descriptionLink = Link.state(this, 'formData').at('description')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    const depositLink = Link.state(this, 'formData').at('deposit')
      .check( v => !isNaN(parseFloat(v)), this.props.translate('validation.event.deposit_is_nan'))
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.event.deposit_is_too_small'))
      .check( v => parseFloat(v) <= 1000000000, this.props.translate('validation.event.deposit_is_too_big'));

    const bidTypeLink = Link.state(this, 'formData').at('bidType')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    return <form onSubmit={this.handleSubmit}>
      <LanguageField />

      <CategoriesField />

      <div className={"form-group" + (nameLink.error ? ' has-error' : '')}>
        <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.name')}*</label>
        <Input valueLink={ nameLink } type='text' id="event[name]" className='form-control' />
        <span id="helpBlock" className="help-block">{ nameLink.error || '' }</span>
      </div>

      <div className={"form-group" + (bidTypeLink.error ? ' has-error' : '')}>
        <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.bid_type')}*</label>
        <Input valueLink={ bidTypeLink } type='text' id="event[bid_type]" className='form-control' />
        <span id="helpBlock" className="help-block">{ bidTypeLink.error || '' }</span>
      </div>

      <div className={"form-group" + (depositLink.error ? ' has-error' : '')}>
        <label htmlFor="event[deposit]">{ this.props.translate('pages.new_event.form.deposit')}*</label>
        <Input valueLink={ depositLink } type='number' id="event[deposit]" className='form-control' />
        <span id="helpBlock" className="help-block">{ depositLink.error || '' }</span>
      </div>

      <div className="form-group">
        <label htmlFor="event[tags]">{ this.props.translate('pages.new_event.form.tags')}*</label>
        <TagsInput value={this.state.formData.tags} onChange={this.handleTagsChange} />
      </div>

      <DateFields />

      <div className={"form-group" + (descriptionLink.error ? ' has-error' : '')}>
        <label htmlFor="event[description]">{ this.props.translate('pages.new_event.form.description')}*</label>
        <TextArea valueLink={ descriptionLink } id="event[description]" className='form-control' />
        <span id="helpBlock" className="help-block">{ descriptionLink.error || '' }</span>
      </div>

      <SourceUrlField />

      <ResultsField />

      <button type="submit" className="btn btn-default" disabled={nameLink.error || depositLink.error}>
        { this.props.translate('pages.new_event.form.submit')}
      </button>
    </form>;
  }
}

function mapStateToProps(state) {
  return {
    saving: state.newEvent.saving,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveEvent: (formData) => {
      dispatch(saveEvent(formData))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EventForm);