import React, { Component } from 'react'
import { connect } from 'react-redux';
import BaseModal from '../../components/modal/BaseModal'
import { getMyBalance } from './../../util/token'

class ModalSend extends Component {

  constructor(props) {
    super(props)
    this.state = {
      balance: 0,
      blockSum: 0.1,
    };
  }

  componentWillMount() {
    getMyBalance(this.props.web3).then((balance) => {
      this.setState({ balance: balance });
    });
  }

  onSendClick() {
    alert('Sending...')
  }

  render() {

    const buttons = [{
      title: 'Cancel',
      className: 'btn-default',
      attrs: {
        'data-dismiss': 'modal'
      }
    },
    {
      title: 'Send',
      className: 'btn-primary',
      attrs: {
        onClick: this.onSendClick
      }
    }]

    return(
      <main className="container">
        <div>
          <BaseModal handleHideModal={this.props.handleHideModal} buttons={buttons} title="Send">
            <form>
              <div className="has-error">
                <div className="control-label">
                  <ul className="list-unstyled">
                    <li>Something goes wrong</li>
                    <li>Another very serious error</li>
                  </ul>
                </div>
              </div>
              <div className="form-group">
                <label>Balance: { this.state.balance.toFixed(2) }</label>
              </div>
              <div className="form-group">
                <label>Block sum: { this.state.blockSum.toFixed(2) }</label>
              </div>
              <div className="form-group">
                <label className="control-label" htmlFor="send[address]">Address</label>
                <input type="text" className="form-control" id="send[address]" placeholder="Address" />
              </div>
              <div className="form-group has-error">
                <label className="control-label" htmlFor="send[sum]">Sum</label>
                <input type="text" className="form-control" id="send[sum]" placeholder="Sum" />
                <span id="helpBlock" className="help-block">Sum is incorrect.</span>
              </div>
              <div className="form-group">
                <label className="control-label" htmlFor="send[fee]">Fee</label>
                <input type="text" className="form-control" id="send[fee]" placeholder="Fee" />
              </div>
            </form>
          </BaseModal>
        </div>
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3
  };
}

export default connect(mapPropsToState)(ModalSend);
