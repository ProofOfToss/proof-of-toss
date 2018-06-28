import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Datetime from "react-datetime";
import Select from 'react-select';
import appConfig from "../../data/config.json"

const BIDDING_END_MINUTES = 11;

class Filter extends Component {

  constructor(props) {
    super(props);

    this.isValidDate = this.isValidDate.bind(this);
    this.renderInput = this.renderInput.bind(this);

    this.dateStartRef = null;
    this.setDateStartRef = (element) => {
      this.dateStartRef = element;
    };

    this.dateEndRef = null;
    this.setDateEndRef = (element) => {
      this.dateEndRef = element;
    };
  }

  isValidDate(currentDate) {
    return currentDate.isSameOrAfter(Datetime.moment().add(BIDDING_END_MINUTES, 'minute'), 'day');
  }

  renderInput(props, openCalendar, closeCalendar) {
    return <div className="form-datetime__input-wrapper">
      <input {...props} />
      <div className="icon form-datetime__input-wrapper-icon" onClick={openCalendar} />
    </div>
  }

  clearValueInDateTimeInput(ref) {
    ref.onInputChange({target: {value: ''}});
  }

  render() {
    return <form className="play-filter__form" onSubmit={this.handleSubmit}>

      <input type="text" className="form-input-text form-input-text_search" value={this.props.q}
             placeholder={ this.props.translate('pages.play.search') } onChange={this.props.onChangeQuery} />

      <Datetime
        ref={this.setDateStartRef}
        value={this.props.fromDate}
        timeFormat={false}
        closeOnSelect={true}
        onChange={this.props.onChangeFromDate}
        isValidDate={this.isValidDate}
        className="form-datetime form-datetime_from"
        renderInput={this.renderInput}
        inputProps={{
          readOnly: true,
          placeholder: this.props.translate('pages.play.filters.from_date')
        }} />

      <div className="form-reset form-reset_date-from" onClick={() => {this.clearValueInDateTimeInput(this.dateStartRef); }}>
        <span className="icon" />
      </div>

      <Datetime
        ref={this.setDateEndRef}
        value={this.props.toDate}
        timeFormat={false}
        closeOnSelect={true}
        onChange={this.props.onChangeToDate}
        isValidDate={this.isValidDate}
        className="form-datetime form-datetime_to"
        renderInput={this.renderInput}
        inputProps={{
          readOnly: true,
          placeholder: this.props.translate('pages.play.filters.to_date')
        }} />

      <div className="form-reset form-reset_date-to" onClick={() => { this.clearValueInDateTimeInput(this.dateEndRef); }}>
        <span className="icon" />
      </div>

      <Select
        name="filter[locale]"
        value={this.props.locale}
        onChange={this.props.onChangeLanguage}
        multi={false}
        className='form-input-select'
        clearable={false}
        searchable={false}
        tabSelectsValue={false}
        options={appConfig.languages.list.map((language, key) => {
          return {label: this.props.translate('language.' + language.code), value: language.code}
        })}
      />

    </form>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(Filter);