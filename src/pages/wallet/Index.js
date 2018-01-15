import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getMyBalance } from './../../util/token'

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = { balance: 0.0 };
  }

  componentWillMount() {
    getMyBalance(this.props.web3).then((balance) => {
      this.setState({ balance: balance });
    });
  }

  render() {
    return(
      <main className="container">
        <div>
          <h1>Wallet page</h1>
          <p>
            Your balance: { this.state.balance.toFixed(2) }
          </p>
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

export default connect(mapPropsToState)(Index);
