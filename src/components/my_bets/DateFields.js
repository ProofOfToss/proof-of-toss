import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import 'react-datetime/css/react-datetime.css'
import Datetime from "react-datetime";

class DateFields extends Component {
  constructor(props) {
    super(props);

    this.showEndTimeError = this.showEndTimeError.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.getEndDateInputProps = this.getEndDateInputProps.bind(this);

    this.state = {
      formData: {
        startTime: props.defaultStartTime || undefined,
        endTime: props.defaultEndTime || undefined
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
        startTime: currentDate ? currentDate : undefined,
        endTime: endTime,
      }
    });

    this.props.onChange({
      'startTime': currentDate,
      'endTime': endTime
    });
  }

  onChangeEndTime(currentDate) {
    if (currentDate) {
      const clonedDate = currentDate.clone()
        .set('hours', '23')
        .set('minutes', '59')
        .set('seconds', '59')
        .set('milliseconds', '999');

      this.setState({
        formData: {
          ...this.state.formData,
          endTime: clonedDate
        }
      });

      this.props.onChange({'endTime': currentDate});
    }  else {
      this.setState({
        formData: {
          ...this.state.formData,
          endTime:  undefined
        }
      });

      this.props.onChange({'endTime': undefined});
    }
  }

  static isValidEndDate(currentDate, startDate, unit = 'day') {
    return !startDate || (!!currentDate && currentDate.isSameOrAfter(startDate, unit));
  }

  showEndTimeError() {
    return false === DateFields.isValidEndDate(this.state.formData.endTime, this.state.formData.startTime, 'minute')
      && this.props.showErrors;
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
              onChange={this.onChangeStartTime}
              value={this.state.formData.startTime}
              timeFormat={false}
              />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_end') }</label>
            <Datetime
              isValidDate={(currentDate) => {return DateFields.isValidEndDate(currentDate, this.state.formData.startTime)}}
              onChange={this.onChangeEndTime}
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
