import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import { getMyAllowance, formatBalance, denormalizeBalance } from './../../util/token';
import { approveEvent } from '../../actions/pages/newEvent'

class Buttons extends Component {
  constructor(props) {
    super(props);

    this.handleApprove = this.handleApprove.bind(this);

    this.state = {
      fetchAllowanceValue: true,
      allowance: 0,
      approved: false
    }
  }

  componentWillMount() {
    getMyAllowance(this.props.web3).then((value) => {
      this.setState({
        fetchAllowanceValue: false,
        allowance: formatBalance(value)
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.deposit === this.props.deposit) {
      return;
    }

    getMyAllowance(this.props.web3).then((value) => {
      this.setState({
        allowance: formatBalance(value)
      })
    })
  }

  handleApprove(e) {
    e.preventDefault();
    this.props.approve(denormalizeBalance(this.props.deposit));
  }

  render() {

    let content;
    const needApprove = (this.state.allowance < this.props.deposit) && false === this.props.approved;

    if(this.state.fetchAllowanceValue) {
      content = <div className='alert alert-danger' role='alert'>
        {this.props.translate('pages.new_event.form.approve.fetching')}
      </div>
    } else {
      content = <Fragment>
        <button type="submit" className="btn btn-default" disabled={needApprove}>
          { this.props.translate('pages.new_event.form.submit')}
        </button>
        { needApprove && <Fragment>
          <a href="#" className="btn btn-warning" onClick={this.handleApprove} >
            {this.props.translate('pages.new_event.form.approve.label')}
          </a>
          <div className='alert alert-warning' role='alert'>
            {this.props.translate('pages.new_event.form.approve.message', {
              allowance: this.state.allowance})
            }
          </div>
        </Fragment> }
      </Fragment>
    }

    return content;
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    approving: state.newEvent.approving,
    approved: state.newEvent.approved,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = {
  approve: approveEvent
}

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);