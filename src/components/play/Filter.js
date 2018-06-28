import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Datetime from "react-datetime";
// import appConfig from "../../data/config.json"

const BIDDING_END_MINUTES = 11;

class Filter extends Component {

  constructor(props) {
    super(props);

    this.isValidDate = this.isValidDate.bind(this);
    this.renderInput = this.renderInput.bind(this);
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

  render() {
    return <form className="play-filter__form" onSubmit={this.handleSubmit}>

      <input type="text" className="form-input-text form-input-text_search" value={this.props.q}
             placeholder={ this.props.translate('pages.play.search') } onChange={this.props.onChangeQuery} />

      <Datetime
        ref={this.dateStartRef}
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

      <Datetime
        ref={this.dateEndRef}
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

      {/*<select id="event[locale]" className="form-control" value={this.state.locale} onChange={this.onChangeLanguage}>*/}
      {/*{*/}
      {/*appConfig.languages.list.map((language, key) => {*/}
      {/*return <option key={language.code} value={language.code}>{this.props.translate('language.' + language.code)}</option>*/}
      {/*})*/}
      {/*}*/}
      {/*</select>*/}

    </form>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(Filter);