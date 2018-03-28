import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'valuelink/tags'

export default class BootstrapInput extends Component {
  render() {
    const showError = this.props.showError && this.props.valueLink.error;

    return <div className={'form-group' + (showError ? ' has-error' : '')}>
      {this.props.label && <label htmlFor={this.props.attr.id}>{this.props.label}</label>}
      <Input valueLink={this.props.valueLink} className='form-control' {...this.props.attr} />
      {showError &&
        <span id="helpBlock" className="help-block">{this.props.valueLink.error}</span>
      }
    </div>
  }
}

BootstrapInput.propTypes = {
  label: PropTypes.string,
  showError: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  attr: PropTypes.shape({
    type: PropTypes.string,
    id: PropTypes.string,
    placeholder: PropTypes.string,
    min: PropTypes.number
  })
};

BootstrapInput.defaultProps = {
  label: null,
  showError: false,
  attr: {
    type: 'text',
    id: '',
    placeholder: '',
    min: 0
  }
};