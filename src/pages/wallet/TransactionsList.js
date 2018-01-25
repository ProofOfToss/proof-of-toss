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
      transactions: []
    }
  }

  handlePageClick(data) {
    browserHistory.push(`/wallet/${data.selected + 1}`);
  }

  hrefBuilder(page) {
    return `/wallet/${page}`
  }

  componentWillMount() {
    getMyTransactions(this.props.web3Local).then(transactions => {
      this.setState({
        pageCount: transactions.length / this.state.perPage,
        transactions: transactions
      })
    });
  }

  render() {
    const page = parseInt(this.props.page, 10) - 1 || 0;
    const hasTransactions = this.state.transactions.length > 0;
    const showPagination = this.state.transactions.length > this.state.perPage;
    let content;

    if(hasTransactions) {
      const pageTransactions = this.state.transactions.slice(page * this.state.perPage, page * this.state.perPage + this.state.perPage);
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
            {pageTransactions.map(function(listItem, key){
              return <TransactionItem  key={key} item={listItem} />
            })}
            </tbody>
          </table>

          {showPagination &&
            <ReactPaginate previousLabel={"previous"}
               nextLabel={"next"}
               breakLabel={<a href="">...</a>}
               breakClassName={"break-me"}
               pageCount={this.state.pageCount}
               initialPage={page}
               disableInitialCallback={page === 0}
               marginPagesDisplayed={2}
               pageRangeDisplayed={5}
               onPageChange={this.handlePageClick}
               hrefBuilder={this.hrefBuilder}
               containerClassName={"pagination"}
               subContainerClassName={"pages pagination"}
               activeClassName={"active"}/>
          }
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
    web3: state.web3.web3,
    web3Local: state.web3.web3Local
  };
}

export default connect(mapPropsToState)(TransactionList);
