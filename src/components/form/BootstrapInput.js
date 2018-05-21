import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'valuelink/tags'

export default class BootstrapInput extends Component {

  renderElement(showError) {
    return <Fragment>
      <Input valueLink={this.props.valueLink} className='form-control' {...this.props.attr} />
      {showError &&
        <span id="helpBlock" className="help-block">{this.props.valueLink.error}</span>
      }
    </Fragment>
  }

  render() {
    const showError = this.props.showError && this.props.valueLink.error;
    const element = this.props.horizontal ? (
      <Fragment>
        {this.props.label && <label className="col-sm-2 control-label" htmlFor={this.props.attr.id}>{this.props.label}</label>}
        <div className="col-sm-10">
          {this.renderElement(showError)}
        </div>
      </Fragment>
    ) : (
      <Fragment>
        {this.props.label && <label htmlFor={this.props.attr.id}>{this.props.label}</label>}
        {this.renderElement(showError)}
      </Fragment>
    );

    return <div className={'form-group' + (showError ? ' has-error' : '')}>
      {element}
    </div>
  }
}

BootstrapInput.propTypes = {
  label: PropTypes.string,
  horizontal: PropTypes.bool,
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
  horizontal: false,
  showError: false,
  attr: {
    type: 'text',
    id: '',
    placeholder: '',
    min: 0
  }
};