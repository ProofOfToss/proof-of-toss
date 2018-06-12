import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate, getActiveLanguage } from 'react-localize-redux';
import Datetime from "react-datetime";
import moment from "moment";

class DatePicker extends Component {

  constructor(props) {
    super(props);

    this.renderInput = this.renderInput.bind(this);
  }

  render() {
    return  <Datetime
        isValidDate={this.props.isValidDate}
        onChange={this.props.onChange}
        timeConstraints={this.props.timeConstraints}
        value={this.props.value}
        renderInput={this.renderInput}
        inputProps={this.getInputProps()}
        className="date-picker"
        locale={moment.locale()}
      />
  }

  renderInput(props, openCalendar, closeCalendar) {
    return <Fragment>
      <div className="row">
        <div className="col-xs-4">
          <div className="input-group">
            <input {...props} />
            <span className="input-group-btn">
              <span className={'btn ' + (this.props.error ? 'btn-danger' : 'btn-default')} onClick={openCalendar}>{this.props.translate('buttons.open')}</span>
            </span>
          </div>
          {this.props.error && <span className="help-block">{this.props.error}</span>}
        </div>
      </div>
    </Fragment>
  }

  getInputProps() {
    const defaultInputProps = {
      disabled: true
    };

    return {...defaultInputProps, ...(this.props.inputProps || {})}
  }
}

DatePicker.defaultProps = {
  error: false
};

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale),
    currentLanguage: getActiveLanguage(state.locale).code
  };
}

export default connect(mapStateToProps)(DatePicker);