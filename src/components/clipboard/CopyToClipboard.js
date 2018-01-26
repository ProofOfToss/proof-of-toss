import React, { Component } from 'react'
import PropTypes from 'prop-types'
const copyToClipboard = require('copy-to-clipboard')

import './CopyToClipboard.scss'

class CopyToClipboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false,
      timeoutId: 0
    };

    this.doCopy = this.doCopy.bind(this);
  }

  doCopy() {
    copyToClipboard(this.props.data);

    clearTimeout(this.state.timeoutId);

    this.setState({
      showTooltip: true,
      timeoutId: setTimeout(this.setState.bind(this, {showTooltip: false}), this.props.tooltipTimeout)
    });
  }

  render() {
    // eslint-disable-next-line
    const { text, data, buttonText, tooltipText, tooltipTimeout, ...rest } = this.props;

    return(
      <div {...rest} className={ this.state.showTooltip ? 'copy-to-clipboard copy-to-clipboard--show-tooltip' : 'copy-to-clipboard copy-to-clipboard--hide-tooltip'}>
        <div className='copy-to-clipboard-text'>{text}</div>
        <div className='copy-to-clipboard-btn'>
          <div className='tooltip left' role='tooltip'>
            <div className='tooltip-arrow' />
            <div className="tooltip-inner">{tooltipText}</div>
          </div>
          <button className='btn btn-xs' onClick={this.doCopy}>
            {buttonText}
          </button>
        </div>
      </div>
    )
  }
}

CopyToClipboard.propTypes = {
  text: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  buttonText: PropTypes.node,
  tooltipText: PropTypes.string,
  tooltipTimeout: PropTypes.number
};

CopyToClipboard.defaultProps = {
  buttonText: 'Copy',
  tooltipText: 'Copied',
  tooltipTimeout: 1000
};

export default CopyToClipboard;
