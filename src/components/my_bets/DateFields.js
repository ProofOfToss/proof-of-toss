import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { getTranslate } from 'react-localize-redux';
import 'react-datetime/css/react-datetime.css'
import Datetime from "react-datetime";

export const DEFAULT_START_TIME = moment();
export const DEFAULT_END_TIME = DEFAULT_START_TIME.clone();

class DateFields extends Component {
  constructor(props) {
    super(props);

    this.showStartTimeError = this.showStartTimeError.bind(this);
    this.showEndTimeError = this.showEndTimeError.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.getEndDateInputProps = this.getEndDateInputProps.bind(this);

    this.state = {
      formData: {
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME
      },
      startTimeError: false,
      endTimeError: false
    }
  }

  onChangeStartTime(currentDate) {
    const endTime = (this.state.formData.endTime < currentDate || !this.state.formData.endTime) ? currentDate.clone() : this.state.formData.endTime;

    this.setState({
      formData: {
        ...this.state.formData,
        startTime: currentDate,
        endTime: endTime,
      }
    });

    this.props.onChange({
      'startTime': currentDate,
      'endTime': endTime
    });
  }

  onChangeEndTime(currentDate) {
    this.setState({
      formData: {
        ...this.state.formData,
        endTime: currentDate.clone()
      }
    });

    this.props.onChange({'endTime': currentDate});
  }

  static isValidStartDate(currentDate, unit = 'day') {
    return currentDate.isSameOrAfter(moment().add(20, 'minute'), unit);
  }

  static isValidEndDate(currentDate, startDate, unit = 'day') {
    return DateFields.isValidStartDate(startDate, unit) && currentDate.isSameOrAfter(startDate, unit);
  }

  showStartTimeError() {
    return false === DateFields.isValidStartDate(this.state.formData.startTime, 'minute') && this.props.showErrors;
  }

  showEndTimeError() {
    return false === DateFields.isValidEndDate(this.state.formData.endTime, this.state.formData.startTime, 'minute')
      && this.props.showErrors;
  }

  calculateStartTimeConstraints() {
    if(this.state.formData.startTime.isSame(moment(), 'day')) {
      return {
        hours: {
          min: moment().hours()
        }
      }
    }

    return {};
  }

  calculateEndTimeConstraints() {
    if(this.state.formData.endTime.isSame(this.state.formData.startTime, 'day')) {
      let timeConstraints = {
        hours: {
          min: this.state.formData.startTime.hours()
        }
      };

      if(this.state.formData.endTime.isSame(this.state.formData.startTime, 'hour')) {
        timeConstraints.minutes = {
          min: this.state.formData.startTime.minutes()
        }
      }

      return timeConstraints;
    }

    return {};
  }

  getEndDateInputProps() {
    if(null === this.state.formData.startTime) {
      return {
        disabled: true
      }
    }
  }

  render() {
    return <Fragment>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_start') }</label>
            <Datetime
              isValidDate={(currentDate) => {return DateFields.isValidStartDate(currentDate)}}
              onChange={this.onChangeStartTime}
              timeConstraints={this.calculateStartTimeConstraints()}
              value={this.state.formData.startTime}
              timeFormat={false}
              error={this.showStartTimeError() ? this.props.translate('pages.play.columns.date_start') : false} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_end') }</label>
            <Datetime
              isValidDate={(currentDate) => {return DateFields.isValidEndDate(currentDate, this.state.formData.endTime)}}
              onChange={this.onChangeEndTime}
              timeConstraints={this.calculateEndTimeConstraints()}
              inputProps={this.getEndDateInputProps()}
              value={this.state.formData.endTime}
              timeFormat={false}
              error={this.showEndTimeError() ? this.props.translate('pages.play.columns.date_end') : false}
            />
          </div>
        </div>
      </div>
    </Fragment>
      ;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(DateFields);
