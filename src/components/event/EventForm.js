import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link/*, { LinkedComponent }*/ from 'valuelink'
import { Input, TextArea/*, Select, Radio, Checkbox*/ } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import LanguageField from './LanguageField'
import CategoriesField from './CategoryField'
import TagsField from './TagsField'
import DateFields, { DEFAULT_START_TIME, DEFAULT_END_TIME} from './DateFields'
import SourceUrlField from './SourceUrlField'
import ResultsField from './ResultsField'
import Buttons from './Buttons'
import ModalConfirm from './ModalConfirm'
import config from "../../data/config.json";
import { formSaveEvent } from '../../actions/pages/newEvent'

class EventForm extends Component {
  constructor(props) {
    super(props);

    this.handleFieldsChange = this.handleFieldsChange.bind(this);
    this.isValid = this.isValid.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      showErrors: false,
      showConfirmModal: false,
      formData: {
        language: config.languages.list[0].code,
        category: config.categories.default,
        name: 'test-' + (Math.random()),
        bidType: 'bid type',
        deposit: 11,
        tags: ['tag_1', 'tag_2'],
        timeZone: config.timeZones.default,
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        description: 'description',
        sourceUrls: ['Source url'],
        results: [{name: 'Result', coefficient: 10}, {name: 'Result 2', coefficient: 30}]
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.saved) {
        this.setState({
          formData: {
            ...this.state.formData,
            ...{
              name: '',
              bidType: '',
              deposit: '',
              tags: [],
              description: '',
              sourceUrls: [],
              results: []
            }
          }
        });
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
    if(this.isValid()) {
      this.props.formSaveEvent(this.state.formData);
      return;
    }

    this.setState({
      showErrors: true
    })
  }

  isValid() {
    return this.nameLink.error === undefined && this.descriptionLink.error === undefined
      && this.depositLink.error === undefined && this.bidTypeLink.error === undefined
      && this.state.formData.tags.length >= 1
      && this.state.formData.sourceUrls.length >= 1 && this.state.formData.results.length >= 2;
  }

  render() {

    this.languageLink = Link.state(this, 'formData').at('language')
      .check( v => v, this.props.translate('validation.required'));

    this.categoryLink = Link.state(this, 'formData').at('category')
      .check( v => v, this.props.translate('validation.required'));

    this.nameLink = Link.state(this, 'formData').at('name')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    this.bidTypeLink = Link.state(this, 'formData').at('bidType')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    this.depositLink = Link.state(this, 'formData').at('deposit')
      .check( v => !isNaN(parseFloat(v)), this.props.translate('validation.event.deposit_is_nan'))
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.event.deposit_is_too_small'))
      .check( v => parseFloat(v) <= this.props.balance, this.props.translate('validation.event.deposit_is_too_big'));

    this.descriptionLink = Link.state(this, 'formData').at('description')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));


    this.timeZoneLink = Link.state(this, 'formData').at('timeZone')
      .check( v => v, this.props.translate('validation.required'));

    return <Fragment>
      <form onSubmit={this.handleSubmit}>
        <LanguageField valueLink={this.languageLink} />

        <CategoriesField valueLink={this.categoryLink} />

        <div className={"form-group" + (this.nameLink.error && this.state.showErrors ? ' has-error' : '')}>
          <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.name')}*</label>
          <Input valueLink={ this.nameLink } type='text' id="event[name]" className='form-control' />
          {this.nameLink.error && this.state.showErrors &&
            <span id="helpBlock" className="help-block">{this.nameLink.error || ''}</span>
          }
        </div>

        <div className={"form-group" + (this.bidTypeLink.error && this.state.showErrors ? ' has-error' : '')}>
          <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.bid_type')}*</label>
          <Input valueLink={ this.bidTypeLink } type='text' id="event[bid_type]" className='form-control' />
          {this.bidTypeLink.error && this.state.showErrors &&
            <span id="helpBlock" className="help-block">{this.bidTypeLink.error || ''}</span>
          }
        </div>

        <div className={"form-group" + (this.depositLink.error && this.state.showErrors ? ' has-error' : '')}>
          <label htmlFor="event[deposit]">{ this.props.translate('pages.new_event.form.deposit')}*</label>
          <Input valueLink={ this.depositLink } type='number' id="event[deposit]" className='form-control' />
          {this.depositLink.error && this.state.showErrors &&
            <span id="helpBlock" className="help-block">{this.depositLink.error || ''}</span>
          }
        </div>

        <TagsField onChange={this.handleFieldsChange} showErrors={this.state.showErrors} />

        <DateFields valueLinkTimeZone={this.timeZoneLink} onChange={this.handleFieldsChange} />

        <div className={"form-group" + (this.descriptionLink.error && this.state.showErrors ? ' has-error' : '')}>
          <label htmlFor="event[description]">{ this.props.translate('pages.new_event.form.description')}*</label>
          <TextArea valueLink={ this.descriptionLink } id="event[description]" className='form-control' />
          {this.descriptionLink.error && this.state.showErrors &&
            <span id="helpBlock" className="help-block">{this.descriptionLink.error || ''}</span>
          }
        </div>

        <SourceUrlField onChange={this.handleFieldsChange} showErrors={this.state.showErrors} />

        <ResultsField onChange={this.handleFieldsChange} showErrors={this.state.showErrors} />

        <Buttons deposit={this.state.formData.deposit} />

      </form>

      {this.props.showConfirmModal ? <ModalConfirm /> : null}
    </Fragment>;
  }
}

function mapStateToProps(state) {
  return {
    saved: state.newEvent.saved,
    showConfirmModal: state.newEvent.showConfirmModal,
    balance: state.token.balance,
    translate: getTranslate(state.locale),
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    formSaveEvent: (formData) => {
      dispatch(formSaveEvent(formData))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EventForm);