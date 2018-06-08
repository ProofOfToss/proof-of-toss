import React, { Component, Fragment } from 'react'
import ReactPaginate from 'react-paginate';
import { getActiveLanguage, getTranslate } from 'react-localize-redux';
import { browserHistory } from 'react-router'
import { connect } from 'react-redux';
import TransactionItem from './TransactionItem'
import { fetchTransactions } from '../../actions/pages/wallet'

class TransactionList extends Component {

  constructor(props) {
    super(props);

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

  componentDidMount() {
    this.props.fetchTransactions();
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.transactions.length !== nextProps.transactions.length) {
      this.setState({
        hasTransactions: nextProps.transactions.length > 0,
        showPagination: nextProps.transactions.length > this.state.perPage,
        pageCount: nextProps.transactions.length / this.state.perPage,
        transactions: nextProps.transactions
      })
    }
  }

  render() {
    const page = parseInt(this.props.page, 10) - 1 || 0;
    let content;

    if(this.state.hasTransactions) {
      const pageTransactions = this.state.transactions.slice(page * this.state.perPage, page * this.state.perPage + this.state.perPage);
      content =
        <Fragment>
          <table className="table">
            <thead>
            <tr>
              <th>{this.props.translate('pages.wallet.transactions_list.time')}</th>
              <th>{this.props.translate('pages.wallet.transactions_list.type')}</th>
              <th>{this.props.translate('pages.wallet.transactions_list.wallet_number')}</th>
              <th>{this.props.translate('pages.wallet.transactions_list.sum')}</th>
              <th>{this.props.translate('pages.wallet.transactions_list.fee')}</th>
            </tr>
            </thead>
            <tbody>
            {pageTransactions.map(function(listItem, key){
              return <TransactionItem  key={key} item={listItem} />
            })}
            </tbody>
          </table>

          {this.state.showPagination &&
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
        content = <div className="well">{this.props.translate('pages.wallet.transactions_list.no_transactions')}</div>
    }

    return(
      <Fragment>
        {content}
      </Fragment>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    transactions: state.wallet.transactions,
    currentLanguage: getActiveLanguage(state.locale).code,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = {
  fetchTransactions
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionList);
