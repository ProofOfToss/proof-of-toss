import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Datetime from "react-datetime";

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
        timeFormat="H:mm"
        value={this.props.value}
        renderInput={this.renderInput}
        inputProps={this.getInputProps()}
        className="date-picker"
      />
  }

  renderInput(props, openCalendar, closeCalendar) {
    return <Fragment>
      <div className="row">
        <div className="col-xs-4">
          <div className="input-group">
            <input {...props} />
            <span className="input-group-btn">
              <span className="btn btn-default" onClick={openCalendar}>{this.props.translate('buttons.open')}</span>
            </span>
          </div>
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

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(DatePicker);