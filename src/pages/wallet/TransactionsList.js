import React, { Component, Fragment } from 'react'
import ReactPaginate from 'react-paginate';
import { browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { getMyTransactions } from './../../util/token'
import TransactionItem from './TransactionItem'

class TransactionList extends Component {

  constructor(props) {
    super(props)

    this.handlePageClick = this.handlePageClick.bind(this)

    this.state = {
      perPage: 5,
      pageCount: 10,
      transactions: [
        // {id: 1, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'aKjmHRXCHg', sum: 0.21, fee: 0.0001},
        // {id: 2, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'CkYKXUpNx1', sum: 1.54, fee: 0.0017},
        // {id: 3, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'hYp2PcijCH', sum: 6.76, fee: 0.0023},
        // {id: 4, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'hYp2PcijCH', sum: 0.34, fee: 0.0003},
        // {id: 5, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'aKjmHRXCHg', sum: 0.21, fee: 0.0001},
        // {id: 6, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'CkYKXUpNx1', sum: 1.54, fee: 0.0017},
        // {id: 7, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'hYp2PcijCH', sum: 6.76, fee: 0.0023},
        // {id: 8, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'hYp2PcijCH', sum: 0.34, fee: 0.0003}
      ]
    }
  }

  handlePageClick(data) {
    browserHistory.push(`/wallet/${data.selected+1}`);
  }

  hrefBuilder(page) {
    return `wallet/${page}`
  }

  componentWillMount() {
    getMyTransactions(this.props.web3).then(transactions => {
      this.setState({
        pageCount: transactions.length / this.state.perPage,
        transactions: transactions
      })
    });
  }

  render() {
    const page = parseInt(this.props.page, 10) || 1;
    const hasTransactions = this.state.transactions.length > 0;
    let content;

    if(hasTransactions) {
      content =
        <Fragment>
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
            {this.state.transactions.map(function(listItem, key){
              return <TransactionItem  key={key} item={listItem} />
            })}
            </tbody>
          </table>

          <ReactPaginate previousLabel={"previous"}
                         nextLabel={"next"}
                         breakLabel={<a href="">...</a>}
                         breakClassName={"break-me"}
                         pageCount={this.state.pageCount}
                         initialPage={page}
                         marginPagesDisplayed={2}
                         pageRangeDisplayed={5}
                         onPageChange={this.handlePageClick}
                         hrefBuilder={this.hrefBuilder}
                         containerClassName={"pagination"}
                         subContainerClassName={"pages pagination"}
                         activeClassName={"active"} />
        </Fragment>
    } else {
        content = <div className="well">No transactions</div>
    }

    return(
      <Fragment>
        {content}
      </Fragment>
    )
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3
  };
}

export default connect(mapPropsToState)(TransactionList);
