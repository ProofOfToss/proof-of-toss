import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import { getMyAllowance } from './../../util/token';
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
        allowance: value,
        approved: value >= this.props.deposit
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.deposit === this.props.deposit) {
      return;
    }

    getMyAllowance(this.props.web3).then((value) => {
      this.setState({
        fetchAllowanceValue: false,
        allowance: value,
        approved: value >= this.props.deposit
      })
    })
  }

  handleApprove(e) {
    e.preventDefault();
    this.props.approve(this.props.deposit);
  }

  render() {

    let content;

    if(this.state.fetchAllowanceValue) {
      content = <div className='alert alert-danger' role='alert'>
        { this.props.translate('pages.new_event.form.approve.fetching')}
      </div>
    } else if(this.state.approved || this.props.approved) {
      content = <button type="submit" className="btn btn-default">
          { this.props.translate('pages.new_event.form.submit')}
        </button>
    } else {
      content = <Fragment>
        <div className='alert alert-warning' role='alert'>
          { this.props.translate('pages.new_event.form.approve.message', {allowance: this.state.allowance})}
        </div>
        <a href="#" className="btn btn-warning" onClick={this.handleApprove} >
          { this.props.translate('pages.new_event.form.approve.label')}
        </a>
      </Fragment>;
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