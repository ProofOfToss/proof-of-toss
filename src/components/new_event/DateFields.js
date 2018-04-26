import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Select } from 'valuelink/tags'
import moment from 'moment';
import { getTranslate } from 'react-localize-redux';
import { TIME_ZONES } from "../../util/timezones";
import DatePicker from "../form/DatePicker";
import config from "../../data/config.json";
import 'react-datetime/css/react-datetime.css'

export const DEFAULT_START_TIME = moment().add(1, 'hours');
export const DEFAULT_END_TIME = DEFAULT_START_TIME.clone();

class DateFields extends Component {
  constructor(props) {
    super(props);

    this.isValidStartDate = this.isValidStartDate.bind(this);
    this.isValidEndDate = this.isValidEndDate.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.getEndDateInputProps = this.getEndDateInputProps.bind(this);

    this.state = {
      timeZones: TIME_ZONES,
      formData: {
        timeZone: config.timeZones.default,
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME
      }
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

  isValidStartDate(currentDate) {
    return currentDate.isSameOrAfter(moment().add(1, 'hour'), 'day');
  }

  isValidEndDate(currentDate) {
    return currentDate.isSameOrAfter(this.state.formData.startTime, 'day');
  }

  calculateStartTimeConstraints() {
    if(this.state.formData.startTime.isSame(moment(), 'day')) {
      return {
        hours: {
          min: moment().hours() // + 1
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
      <div className={"form-group" + (this.props.valueLinkTimeZone.error ? ' has-error' : '')}>
        {this.state.timeZones.length > 0 &&
          <Fragment>
            <label htmlFor="event[time_zone]">{ this.props.translate('pages.new_event.form.time_zone')}*</label>
            <Select valueLink={this.props.valueLinkTimeZone} type='text' id="event[time_zone]" className='form-control'>
              {this.state.timeZones.map((timeZone, key) => {
                return <option key={key} value={key}>{timeZone}</option>
              }, this)}
            </Select>
            <span id="helpBlock" className="help-block">{ this.props.valueLinkTimeZone.error || '' }</span>
          </Fragment>
        }
      </div>

      <div className="form-group">
        <label htmlFor="event[date_start]">{ this.props.translate('pages.new_event.form.date_start')}*</label>
        <DatePicker isValidDate={this.isValidStartDate} onChange={this.onChangeStartTime}
          timeConstraints={this.calculateStartTimeConstraints()} timeFormat="H:mm"
          value={this.state.formData.startTime}/>
      </div>

      <div className="form-group">
        <label htmlFor="event[date_end]">{ this.props.translate('pages.new_event.form.date_end')}*</label>
        <DatePicker isValidDate={this.isValidEndDate} onChange={this.onChangeEndTime}
            timeConstraints={this.calculateEndTimeConstraints()} timeFormat="H:mm" inputProps={this.getEndDateInputProps()}
            value={this.state.formData.endTime}
         />
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