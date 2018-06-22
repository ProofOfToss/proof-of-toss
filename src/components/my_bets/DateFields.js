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
    };

    this.dateStartRef = React.createRef();
    this.dateEndRef = React.createRef();
  }

  onChangeStartTime(currentDate) {
    if (Datetime.moment.isMoment(currentDate) && currentDate.isValid()) {
      const endTime = (this.state.formData.endTime < currentDate || !this.state.formData.endTime) ? currentDate : this.state.formData.endTime;
      const clonedDate = endTime.clone()
        .set('hours', '0')
        .set('minutes', '0')
        .set('seconds', '0')
        .set('milliseconds', '0');

      this.setState({
        formData: {
          ...this.state.formData,
          startTime: currentDate ? currentDate : undefined,
          endTime: clonedDate,
        }
      });

      this.props.onChange({
        'startTime': currentDate,
        'endTime': clonedDate
      });
    } else if (!currentDate) {
      this.setState({
        formData: {
          ...this.state.formData,
          startTime:  undefined
        }
      });

      this.props.onChange({'startTime': undefined});
    }
  }

  onChangeEndTime(currentDate) {
    if (Datetime.moment.isMoment(currentDate) && currentDate.isValid()) {
      this.setState({
        formData: {
          ...this.state.formData,
          endTime: currentDate
        }
      });

      this.props.onChange({'endTime': currentDate});
    } else if (!currentDate) {
      this.setState({
        formData: {
          ...this.state.formData,
          endTime:  undefined
        }
      });

      this.props.onChange({'endTime': undefined});
    }
  }

  clearValueInDateTimeInput(ref) {
    ref.current.onInputChange({target: {value: ''}});
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
        <div className="col-md-5">
          <div className="form-group date-start">
            <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_start') }</label>
            <Datetime
              ref={this.dateStartRef}
              onChange={this.onChangeStartTime}
              value={this.state.formData.startTime}
              timeFormat={false}
              inputProps={{readOnly: true}}
              />
          </div>
        </div>
        <div className="col-md-1">
          <div className="form-group reset-date">
            <label>&nbsp;</label>
            <button className="btn btn-secondary" onClick={() => { this.clearValueInDateTimeInput(this.dateStartRef); }}>{this.props.translate('pages.play.filters.reset_date')}</button>
          </div>
        </div>
        <div className="col-md-5">
          <div className="form-group date-end">
            <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_end') }</label>
            <Datetime
              ref={this.dateEndRef}
              isValidDate={(currentDate) => {return DateFields.isValidEndDate(currentDate, this.state.formData.startTime)}}
              onChange={this.onChangeEndTime}
              inputProps={this.getEndDateInputProps()}
              value={this.state.formData.endTime}
              timeFormat={false}
              error={this.showEndTimeError() ? this.props.translate('pages.play.columns.date_end') : false}
              inputProps={{readOnly: true}}
            />
          </div>
        </div>
        <div className="col-md-1">
          <div className="form-group reset-date">
            <label>&nbsp;</label>
            <button className="btn btn-secondary" onClick={() => { this.clearValueInDateTimeInput(this.dateEndRef); }}>{this.props.translate('pages.play.filters.reset_date')}</button>
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
