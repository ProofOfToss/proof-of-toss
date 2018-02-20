import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link/*, { LinkedComponent }*/ from 'valuelink'
import { Input, TextArea/*, Select, Radio, Checkbox*/ } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import TagsInput from 'react-tagsinput'
import LanguageField, { DEFAULT_LANGUAGE } from './LanguageField'
import CategoriesField, { DEFAULT_CATEGORY } from './CategoryField'
import DateFields, { DEFAULT_TIMEZONE, DEFAULT_START_TIME, DEFAULT_END_TIME} from './DateFields'
import SourceUrlField from './SourceUrlField'
import ResultsField from './ResultsField'
import 'react-tagsinput/react-tagsinput.css'
import { saveEvent } from '../../actions/pages/newEvent'

class EventForm extends Component {
  constructor(props) {
    super(props);

    this.handleFieldsChange = this.handleFieldsChange.bind(this);
    this.isValid = this.isValid.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      saving: false,
      formData: {
        language: DEFAULT_LANGUAGE,
        category: DEFAULT_CATEGORY,
        name: 'test-' + (Math.random()),
        bidType: 'bid type',
        deposit: 10,
        tags: [],
        timeZone: DEFAULT_TIMEZONE,
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        description: 'description',
        sourceUrls: [],
        results: []
      }
    }
  }

  handleFieldsChange(state) {
    this.setState({
      formData: {
        ...this.state.formData,
        ...state
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.saveEvent(this.state.formData);
  }

  isValid() {
    return this.nameLink.error === undefined && this.descriptionLink.error === undefined
      && this.depositLink.error === undefined && this.bidTypeLink.error === undefined
      && this.state.formData.sourceUrls.length >= 1 && this.state.formData.results.length >= 2;
  }

  render() {

    this.nameLink = Link.state(this, 'formData').at('name')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    this.descriptionLink = Link.state(this, 'formData').at('description')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    this.depositLink = Link.state(this, 'formData').at('deposit')
      .check( v => !isNaN(parseFloat(v)), this.props.translate('validation.event.deposit_is_nan'))
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.event.deposit_is_too_small'))
      .check( v => parseFloat(v) <= 1000000000, this.props.translate('validation.event.deposit_is_too_big'));

    this.bidTypeLink = Link.state(this, 'formData').at('bidType')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    return <form onSubmit={this.handleSubmit}>
      <LanguageField onChange={this.handleFieldsChange} />

      <CategoriesField onChange={this.handleFieldsChange} />

      <div className={"form-group" + (this.nameLink.error ? ' has-error' : '')}>
        <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.name')}*</label>
        <Input valueLink={ this.nameLink } type='text' id="event[name]" className='form-control' />
        <span id="helpBlock" className="help-block">{ this.nameLink.error || '' }</span>
      </div>

      <div className={"form-group" + (this.bidTypeLink.error ? ' has-error' : '')}>
        <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.bid_type')}*</label>
        <Input valueLink={ this.bidTypeLink } type='text' id="event[bid_type]" className='form-control' />
        <span id="helpBlock" className="help-block">{ this.bidTypeLink.error || '' }</span>
      </div>

      <div className={"form-group" + (this.depositLink.error ? ' has-error' : '')}>
        <label htmlFor="event[deposit]">{ this.props.translate('pages.new_event.form.deposit')}*</label>
        <Input valueLink={ this.depositLink } type='number' id="event[deposit]" className='form-control' />
        <span id="helpBlock" className="help-block">{ this.depositLink.error || '' }</span>
      </div>

      <div className="form-group">
        <label htmlFor="event[tags]">{ this.props.translate('pages.new_event.form.tags')}*</label>
        <TagsInput value={this.state.formData.tags} onChange={(tags) => {this.handleFieldsChange({tags: tags})}} />
      </div>

      <DateFields onChange={this.handleFieldsChange} />

      <div className={"form-group" + (this.descriptionLink.error ? ' has-error' : '')}>
        <label htmlFor="event[description]">{ this.props.translate('pages.new_event.form.description')}*</label>
        <TextArea valueLink={ this.descriptionLink } id="event[description]" className='form-control' />
        <span id="helpBlock" className="help-block">{ this.descriptionLink.error || '' }</span>
      </div>

      <SourceUrlField onChange={this.handleFieldsChange}/>

      <ResultsField onChange={this.handleFieldsChange} />

      <button type="submit" className="btn btn-default" disabled={!this.isValid()}>
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