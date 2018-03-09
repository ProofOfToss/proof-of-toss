import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Select } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import { TIME_ZONES } from "../../util/timezones";
import Datetime from "react-datetime"
import config from "../../data/config.json";
import 'react-datetime/css/react-datetime.css'

export const DEFAULT_START_TIME = Datetime.moment().add(1, 'hours');
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
      },
      startTimeConstraints: {
        hours: {
          min: DEFAULT_START_TIME.hours()
        }
      },
      endTimeConstraints: {
        hours: {
          min: DEFAULT_START_TIME.hours()
        }
      }
    }
  }

  onChangeStartTime(currentDate) {

    const timeConstraints = this.calculateStartTimeConstraints(currentDate);

    this.setState({
      formData: {
        ...this.state.formData,
        startTime: currentDate,
        endTime: currentDate.clone()
      },
      startTimeConstraints: timeConstraints,
      endTimeConstraints: timeConstraints
    });

    this.props.onChange('startTime', currentDate);
  }

  onChangeEndTime(currentDate) {

    let endTime = currentDate;

    this.setState({
      formData: {
        ...this.state.formData,
        endTime: endTime
      },
      endTimeConstraints: this.calculateEndTimeConstraints(currentDate)
    });

    this.props.onChange('endTime', endTime);
  }

  isValidStartDate(currentDate) {
    return currentDate.isSameOrAfter(Datetime.moment().add(1, 'hour'), 'day');
  }

  isValidEndDate(currentDate) {
    return currentDate.isSameOrAfter(this.state.formData.startTime, 'day');
  }

  calculateStartTimeConstraints(currentDate) {
    if(currentDate.isSame(Datetime.moment(), 'day')) {
      return {
        hours: {
          min: Datetime.moment().hours() + 1
        }
      }
    }

    return {};
  }

  calculateEndTimeConstraints(currentDate) {
    if(currentDate.isSame(this.state.formData.startTime, 'day')) {
      return {
        hours: {
          min: this.state.formData.startTime.hours()
        }
      }
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
            <Select valueLink={this.props.valueLinkTimeZone} type='text' id="event[time_zone]" className='form-control'
                    >
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
        <Datetime isValidDate={this.isValidStartDate} onChange={this.onChangeStartTime}
          timeConstraints={this.state.startTimeConstraints} timeFormat="H:mm"
                  value={this.state.formData.startTime}/>
      </div>

      <div className="form-group">
        <label htmlFor="event[date_start]">{ this.props.translate('pages.new_event.form.date_end')}*</label>
        <Datetime isValidDate={this.isValidEndDate} onChange={this.onChangeEndTime}
            timeConstraints={this.state.endTimeConstraints} timeFormat="H:mm" inputProps={this.getEndDateInputProps()}
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