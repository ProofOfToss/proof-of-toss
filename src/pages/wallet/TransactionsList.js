import React, { Component, Fragment } from 'react'
import ReactPaginate from 'react-paginate';
import { getActiveLanguage } from 'react-localize-redux';
import { browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { strings } from '../../util/i18n';
import { getMyTransactions } from './../../util/token'
import TransactionItem from './TransactionItem'

class TransactionList extends Component {

  constructor(props) {
    super(props)

    this.handlePageClick = this.handlePageClick.bind(this);
    this.hrefBuilder = this.hrefBuilder.bind(this);

    this.state = {
      perPage: 5,
      pageCount: 10,
      transactions: []
    }
  }

  handlePageClick(data) {
    browserHistory.push(`/${this.props.currentLanguage}/wallet/${data.selected + 1}`);
  }

  hrefBuilder(page) {
    return `/${this.props.currentLanguage}/wallet/${page}`
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
              <th>{strings().pages.wallet.transactions_list.time}</th>
              <th>{strings().pages.wallet.transactions_list.type}</th>
              <th>{strings().pages.wallet.transactions_list.wallet_number}</th>
              <th>{strings().pages.wallet.transactions_list.sum}</th>
              <th>{strings().pages.wallet.transactions_list.fee}</th>
            </tr>
            </thead>
            <tbody>
            {pageTransactions.map(function(listItem, key){
              return <TransactionItem  key={key} item={listItem} />
            })}
            </tbody>
          </table>

          {showPagination &&
            <ReactPaginate
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
    currentLanguage: getActiveLanguage(state.locale).code
  };
}

export default connect(mapPropsToState)(TransactionList);
