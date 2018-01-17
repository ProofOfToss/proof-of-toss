import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getMyBalance } from './../../util/token'
import TransactionItem from './TransactionItem'
import ModalDeposit from './ModalDeposit'

class Index extends Component {
  constructor(props) {
    super(props);

    this.handleDepositShowModal = this.handleDepositShowModal.bind(this)
    this.handleDepositHideModal = this.handleDepositHideModal.bind(this)

    this.state = {
      balance: 0.0,
      blockSum: 0.1,
      transactions: [
        {id: 1, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'aKjmHRXCHg', sum: 0.21, fee: 0.0001},
        {id: 2, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'CkYKXUpNx1', sum: 1.54, fee: 0.0017},
        {id: 3, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'hYp2PcijCH', sum: 6.76, fee: 0.0023},
        {id: 4, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'hYp2PcijCH', sum: 0.34, fee: 0.0003}
      ],
      view: {
        showDepositModal: false,
        showSendModal: false
      }
    }
  }

  randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  componentWillMount() {
    getMyBalance(this.props.web3).then((balance) => {
      this.setState({ balance: balance });
    });
  }

  handleDepositShowModal() {
    this.setState({view: {showDepositModal: true}})
  }

  handleDepositHideModal() {
    this.setState({view: {showDepositModal: false}})
  }

  render() {
    return(
      <main className="container wallet-index">
        <h1>TOSS</h1>
        <dl className="dl-horizontal">
          <dt>Your balance</dt>
          <dd>{ this.state.balance.toFixed(2) }</dd>

          <dt>Block sum</dt>
          <dd>
            <input disabled type="email" className="form-control" id="inputEmail3" placeholder="Email"
               value={this.state.blockSum.toFixed(2)}/>
          </dd>

          <dt />
          <dd>
            <button className="btn btn-primary">Send</button >
            <button className="btn btn-primary" onClick={this.handleDepositShowModal}>Deposit</button >
          </dd>
        </dl>

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Wallet number</th>
              <th>Sum</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
          {this.state.transactions.map(function(listItem){
            return <TransactionItem  key={listItem.id} item={listItem} />
          })}
          </tbody>
        </table>

        {this.state.view.showDepositModal ? <ModalDeposit handleHideModal={this.handleDepositHideModal}/> : null}
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3
  };
}

export default connect(mapPropsToState)(Index);
