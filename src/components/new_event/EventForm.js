import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Input, TextArea } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import moment from 'moment';
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
      submitClick: moment(),
      formData: {
        language: config.languages.list[0].code,
        category: config.categories.default,
        name: '',
        bidType: '',
        deposit: 0,
        tags: [],
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        description: '',
        sourceUrls: [],
        results: []
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

    if (this.isValid()) {
      this.props.formSaveEvent(this.state.formData);
      this.setState({showErrors: false, submitClick: moment()});

      return;
    }

    this.setState({showErrors: true, submitClick: moment()});
  }

  isValid() {
    return DateFields.isValidStartDate(this.state.formData.startTime, 'minute') &&
      DateFields.isValidEndDate(this.state.formData.endTime, this.state.formData.startTime, 'minute') &&
      this.nameLink.error === undefined && this.descriptionLink.error === undefined
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
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.to_small', {value: 1}))
      .check( v => parseFloat(v) <= this.props.normalizeBalance, this.props.translate('validation.to_big', {value: this.props.normalizeBalance}));

    this.descriptionLink = Link.state(this, 'formData').at('description')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    return <Fragment>
      <form onSubmit={this.handleSubmit} className="new-event" noValidate >
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
          <Input valueLink={ this.depositLink } type='number' id="event[deposit]" className='form-control'
                 min="1" max={this.props.normalizeBalance} />
          {this.depositLink.error && this.state.showErrors &&
            <span id="helpBlock" className="help-block">{this.depositLink.error || ''}</span>
          }
        </div>

        <TagsField needToClear={this.props.saved} onChange={this.handleFieldsChange} showErrors={this.state.showErrors} />

        <DateFields onChange={this.handleFieldsChange} showErrors={this.state.showErrors} submitClick={this.state.submitClick} />

        <div className={"form-group" + (this.descriptionLink.error && this.state.showErrors ? ' has-error' : '')}>
          <label htmlFor="event[description]">{ this.props.translate('pages.new_event.form.description')}*</label>
          <TextArea valueLink={ this.descriptionLink } id="event[description]" className='form-control' />
          {this.descriptionLink.error && this.state.showErrors &&
            <span id="helpBlock" className="help-block">{this.descriptionLink.error || ''}</span>
          }
        </div>

        <SourceUrlField onChange={this.handleFieldsChange} showErrors={this.state.showErrors} />

        <ResultsField onChange={this.handleFieldsChange} showErrors={this.state.showErrors} isOperatorEvent={false} />

        <Buttons />

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
    normalizeBalance: state.token.normalizeBalance,
    translate: getTranslate(state.locale)
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