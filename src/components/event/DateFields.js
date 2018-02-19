import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Select } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import timezones from "timezones.json"
import Datetime from "react-datetime"
import 'react-datetime/css/react-datetime.css'

class DateFields extends Component {
  constructor(props) {
    super(props);

    this.isValidStartDate = this.isValidStartDate.bind(this);
    this.isValidEndDate = this.isValidEndDate.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);

    this.state = {
      timeZones: [].concat.apply([], timezones.map((item) => {
        return item.utc
      })),
      formData: {
        timeZone: '10',
        startTime: null,
        endTime: null
      },
      now: Datetime.moment().add( 1, 'hour' )
    }
  }

  onChangeStartTime(currentDate) {
    this.setState({
      formData: {
        ...this.state.formData,
        startTime: currentDate
      }
    })
  }

  onChangeEndTime(currentDate) {
    this.setState({
      formData: {
        ...this.state.formData,
        endTime: currentDate
      }
    })
  }

  isValidStartDate(currentDate) {
    return currentDate.isAfter( this.state.now );
  }

  isValidEndDate(currentDate) {
    return currentDate.isSameOrAfter( this.state.formData.startTime );
  }

  render() {
    const timeZoneLink = Link.state(this, 'formData').at('timeZone')
      .check( v => v, this.props.translate('validation.required'))
    ;

    return <Fragment>
      <div className={"form-group" + (timeZoneLink.error ? ' has-error' : '')}>
        {this.state.timeZones.length > 0 &&
          <Fragment>
            <label htmlFor="event[time_zone]">{ this.props.translate('pages.new_event.form.time_zone')}*</label>
            <Select valueLink={timeZoneLink} type='text' id="event[time_zone]" className='form-control'
                    value={this.state.formData.timeZone}>
              {this.state.timeZones.map((timeZone, key) => {
                return <option key={key} value={key}>{timeZone}</option>
              }, this)}
            </Select>
            <span id="helpBlock" className="help-block">{ timeZoneLink.error || '' }</span>
          </Fragment>
        }
      </div>

      <div className="form-group">
        <label htmlFor="event[date_start]">{ this.props.translate('pages.new_event.form.date_start')}*</label>
        <Datetime isValidDate={this.isValidStartDate} onChange={this.onChangeStartTime} closeOnSelect={true}/>
      </div>

      <div className="form-group">
        <label htmlFor="event[date_start]">{ this.props.translate('pages.new_event.form.date_end')}*</label>
        <Datetime isValidDate={this.isValidEndDate} onChange={this.onChangeEndTime} closeOnSelect={true} />
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