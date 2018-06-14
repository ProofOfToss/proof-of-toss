import 'babel-polyfill';
import React, { Component, Fragment } from 'react';
import Datetime from "react-datetime";
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import _ from "lodash";
const queryString = require('query-string');
import { Link } from 'react-router';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import { modalWithdrawShow } from '../../../actions/pages/event';
import { refreshBalance } from '../../../actions/token';
import store from '../../../store';
import { TX_STATUS_DEFAULT, TX_STATUS_REJECTED } from '../../../actions/tx';
import '../../../styles/components/play_table.scss';

import appConfig from "../../../data/config.json"
import { myPrizeConditions, myPrizeBetConditions, bidInfo } from '../../../util/searchUtil';
import { formatWithdrawal } from '../../../util/token';

const LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE = 'LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE';
const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const BET_INDEX = 'toss_bet_' + appConfig.elasticsearch.indexPostfix;

class PlayerWithdraw extends Component {
  constructor(props) {
    super(props);

    window.Index = this;

    this.state = this.getStateFromQueryString(props);

    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeFromDate = this.onChangeFromDate.bind(this);
    this.onChangeToDate = this.onChangeToDate.bind(this);
    this.onChangeQuery = this.onChangeQuery.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.isValidDate = this.isValidDate.bind(this);
    this.getUrlParams = this.getUrlParams.bind(this);
    this.update = this.update.bind(this);
    this.updateDebounce = this.updateDebounce.bind(this);

    this.dateStartRef = React.createRef();
    this.dateEndRef = React.createRef();
  }

  getUrlParams() {
    let params = queryString.parse(window.location.search);

    ['q', 'category', 'fromTimestamp', 'toTimestamp', 'page', 'sortField', 'sortOrder'].forEach((field) => {
      if (this.state[field]) {
        params['p_' + field] = this.state[field];
      }
    });

    return queryString.stringify(params);
  }

  getStateFromQueryString(props) {
    const parsed = queryString.parse(props.location.search);
    ['q', 'category', 'fromTimestamp', 'toTimestamp', 'page', 'sortField', 'sortOrder'].forEach((field) => {
      if (parsed['p_' + field]) {
        parsed[field] = parsed['p_' + field];
      }
    });

    return {
      locale: props.locale,

      categories: appConfig.categories.list,
      data: [],

      loading: true,
      error: null,

      q: parsed.q,
      fromDate: parsed.fromTimestamp ? Datetime.moment(new Date(parseInt(parsed.fromTimestamp, 10) * 1000)) : null,
      toDate: parsed.toTimestamp ? Datetime.moment(new Date(parseInt(parsed.toTimestamp, 10) * 1000)) : null,
      fromTimestamp: parsed.fromTimestamp && parseInt(parsed.fromTimestamp, 10),
      toTimestamp: parsed.toTimestamp && parseInt(parsed.toTimestamp, 10),

      pageSize: parseInt(localStorage.getItem(LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE), 10) || 10,
      page: parseInt(parsed.page, 10) || 1,
      total: 0,
      sortField: parsed.sortField || 'bidSum',
      sortOrder: parsed.sortOrder || 'desc'
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromQueryString(nextProps), this.update);
  }

  componentDidMount() {
    // @todo: we use defaultSorted prop for BootstrapTable which triggers table change which triggers elastic search query
    // if we uncomment this.update() below there will be two identical queries to elastic search at the initial page loading
    //this.update();

    if (this.props.refreshInterval !== false) {
      this.refreshIntervalId = setInterval(this.update, parseInt(this.props.refreshInterval, 10));
    }
  }

  componentWillUnmount() {
    if (this.props.refreshInterval !== false) {
      clearInterval(this.refreshIntervalId);
    }
  }

  handleTableChange(type, state) {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    if (state.sizePerPage) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE, state.sizePerPage);
    }

    this.setState({
      loading: true,
      page: state.page || this.state.page,
      pageSize: state.sizePerPage || this.state.pageSize,
      sortField: state.sortField || this.state.sortField,
      sortOrder: state.sortOrder || this.state.sortOrder,
    }, this.update);
  }

  modalWithdrawShow(event, userBet, betTx, withdrawalAmount) {
    const withdraw = {
      address: event,
      type: 'userBet',
      userBet,
      betTx,
      withdrawalAmount
    };

    this.props.modalWithdrawShow(withdraw);
  }

  isValidDate(currentDate) {
    return true;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.update();
  }

  onChangeFromDate(fromDate) {
    this.setState({
      fromDate,
      fromTimestamp: fromDate ? parseInt(fromDate.hour(0).minute(0).second(0).unix(), 10) : null,
      page: 1,
    }, this.update);
  }

  onChangeToDate(toDate) {
    this.setState({
      toDate,
      toTimestamp: toDate ? parseInt(toDate.hour(23).minute(59).second(59).unix(), 10) : null,
      page: 1,
    }, this.update);
  }

  clearValueInDateTimeInput(ref) {
    ref.current.onInputChange({target: {value: ''}});
  }

  onChangeQuery(e) {
    this.setState({
      q: e.target.value,
      page: 1,
    }, this.updateDebounce);
  }

  onChangeCategory(category) {
    this.setState({
      category,
      page: 1,
    }, this.update);
  }

  updateDebounce(ms = 300) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(this.update, ms);
  }

  async update() {
    history.replaceState({}, '', `/${this.state.locale}/cabinet/withdraw?${this.getUrlParams()}`);

    let {conditions, shouldConditions} = myPrizeConditions(
      this.state.locale,
      this.props.currentAddress,
      this.state.q,
      this.state.fromTimestamp,
      this.state.toTimestamp
    );

    try {
      const res = await this.props.esClient.search(Object.assign({
        index: EVENT_INDEX,
        size: this.state.pageSize,
        from: (this.state.page - 1) * this.state.pageSize,
        sort: `${this.state.sortField}:${this.state.sortOrder}`,
      }, conditions.length > 0 ? {
        body: {
          query: {
            bool: {
              must: conditions,
              "filter": {
                "bool": {
                  "should": shouldConditions
                }
              }
            }
          }
        }
      } : {}));

      conditions = myPrizeBetConditions(this.props.currentAddress, res.hits.hits).conditions;

      const bidsRes = await this.props.esClient.search(Object.assign({
        index: BET_INDEX,
        sort: `timestamp:desc`,
        body: {
          query: {
            bool: {
              must: conditions,
            }
          }
        }
      }));

      const bidsByEvents = _.groupBy(_.map(bidsRes.hits.hits, (res) => {
        return Object.assign({tx: res._id}, res._source)
      }), 'event');

      const data = _.map(res.hits.hits, '_source').reduce(
        (accumulator, event) => {
          const bids = bidsByEvents[event.address];

          if (!bids) {
            return accumulator;
          }

          const bidsLength = bids.length;
          accumulator.push(Object.assign({rowSpan: bidsLength}, event, bidInfo(bids[0], event)));

          for (let i = 1; i < bidsLength; i++) {
            accumulator.push(Object.assign({rowSpan: -1}, event, bidInfo(bids[i], event)));
          }

          return accumulator;
        }, []);

      this.setState({
        data: data,
        total: res.hits.total,
        loading: false,
      });
    } catch (e) {
      console.error(e);

      this.setState({
        loading: false,
        error: e,
      });
    }

    store.dispatch(refreshBalance(this.props.currentAddress));
  }

  render() {
    const { data, categories } = this.state;

    const rowAttrs = (cell, row, rowIndex, colIndex) => {
      return row.rowSpan > 0 ? {rowSpan: row.rowSpan} : {};
    };

    const rowClasses = (row, rowIndex) => {
      const classes = [];

      if (row.rowSpan === -1) { classes.push('multiple-bets-row'); }
      if (row.isWinningBet) { classes.push('winning-bet-row'); }

      return classes.join(' ');
    };

    return(
      <Fragment>
        <form className="form play-form" onSubmit={this.handleSubmit}>

          <div className="row">
            <div className="col-md-5">
              <div className="form-group date-start">
                <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_start') }</label>
                <Datetime
                  ref={this.dateStartRef}
                  value={this.state.fromDate}
                  timeFormat={false}
                  closeOnSelect={true}
                  onChange={this.onChangeFromDate}
                  isValidDate={this.isValidDate}
                  inputProps={{readOnly: true}}
                />
              </div>
            </div>
            <div className="col-md-1">
              <div className="form-group reset-date">
                <label>&nbsp;</label>
                <button className="btn btn-secondary" onClick={() => { this.clearValueInDateTimeInput(this.dateStartRef); }}>{this.props.translate('pages.play.filters.reset_date')}</button>
              </div>
            </div>
            <div className="col-md-5">
              <div className="form-group date-end">
                <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_end') }</label>
                <Datetime
                  ref={this.dateEndRef}
                  value={this.state.toDate}
                  timeFormat={false}
                  closeOnSelect={true}
                  onChange={this.onChangeToDate}
                  isValidDate={this.isValidDate}
                  inputProps={{readOnly: true}}
                />
              </div>
            </div>
            <div className="col-md-1">
              <div className="form-group reset-date">
                <label>&nbsp;</label>
                <button className="btn btn-secondary" onClick={() => { this.clearValueInDateTimeInput(this.dateEndRef); }}>{this.props.translate('pages.play.filters.reset_date')}</button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
                <input type="text" className="form-control" value={this.state.q} placeholder={ this.props.translate('pages.play.search') } onChange={this.onChangeQuery} />
            </div>
          </div>

        </form>
        <div className="playTable">
          <BootstrapTable
            ref="table"
            keyField="tx"
            data={ data }
            columns={ [
              {
                text: this.props.translate('pages.play.columns.name'),
                dataField: "name",
                sort: false,
                attrs: rowAttrs,
              },
              {
                text: this.props.translate('pages.play.columns.tags'),
                dataField: "tag",
                sort: false,
                attrs: rowAttrs,
                formatter: (tags) => _.map(tags, 'name').join(', '),
              },
              {
                text: this.props.translate('pages.play.columns.bid_type'),
                dataField: "bidType",
                sort: false,
                attrs: rowAttrs,
                width: 200,
              },
              {
                text: this.props.translate('pages.play.columns.category'),
                dataField: "category",
                sort: false,
                width: 200,
                attrs: rowAttrs,
                formatter: (categoryId) => {
                  const category = _.find(categories, (cat) => cat.id === parseInt(categoryId, 10));

                  return category ? this.props.translate(`categories.${category.name}`) : categoryId;
                },
              },
              {
                text: this.props.translate('pages.play.columns.start_date'),
                dataField: "startDate",
                sort: true,
                width: 200,
                attrs: rowAttrs,
                formatter: (cell) => Datetime.moment(new Date(parseInt(cell, 10) * 1000)).format('LLL'),
              },
              {
                text: this.props.translate('pages.play.columns.bid_result'),
                dataField: "bidResult",
                sort: false,
                width: 150,
                formatter: (cell) => <span className="bid-result">{cell}</span>
              },
              {
                text: this.props.translate('pages.play.columns.bid_sum'),
                dataField: "bidSum",
                sort: false,
                width: 150,
              },
              {
                text: this.props.translate('pages.play.columns.bid_date'),
                dataField: "bidDate",
                sort: false,
                width: 200,
                formatter: (cell) => Datetime.moment(new Date(parseInt(cell, 10) * 1000)).format('LLL'),
              },
              {
                text: this.props.translate('pages.play.columns.result_coefficient'),
                dataField: "coefficient",
                sort: false,
                width: 150,
                formatter: (cell) => isNaN(parseFloat(cell)) ? '-' : parseFloat(cell).toFixed(2),
              },
              {
                text: this.props.translate('pages.play.columns.prize'),
                dataField: "prize",
                sort: false,
                width: 200,
                formatter: (cell, row) => {
                  let txStatus = this.props.txStatuses['withdrawPrize_' + row.tx];
                  txStatus = txStatus ? txStatus : {status: TX_STATUS_DEFAULT};

                  return (
                    (txStatus.status === TX_STATUS_REJECTED || txStatus.status === TX_STATUS_DEFAULT)
                      ? <span className="btn btn-primary" onClick={() => {this.modalWithdrawShow(row.address, row.userIndex, row.tx, cell)}}>
                        {
                          row.hasDefinedResult
                            ? this.props.translate('pages.play.withdraw_button', {
                              amount: formatWithdrawal(cell),
                              symbol: appConfig.view.token_symbol
                            })
                            : this.props.translate('pages.play.get_back_button', {
                              amount: formatWithdrawal(cell),
                              symbol: appConfig.view.token_symbol
                            })
                        }
                      </span>
                      : <span className="btn btn-primary" disabled="disabled">
                        {
                          row.hasDefinedResult
                            ? this.props.translate('pages.play.withdraw_button', {
                              amount: formatWithdrawal(cell),
                              symbol: appConfig.view.token_symbol
                            })
                            : this.props.translate('pages.play.get_back_button', {
                              amount: formatWithdrawal(cell),
                              symbol: appConfig.view.token_symbol
                            })
                        }
                      </span>
                  );
                }
              },
              {
                text: '',
                dataField: 'address',
                sort: false,
                width: 100,
                attrs: rowAttrs,
                formatter: (cell) => {
                  return <Link to={`/${this.state.locale}/event/${cell}`}>{ this.props.translate('pages.play.more') }</Link>
                }
              }
            ] }
            rowClasses={ rowClasses }
            // @todo: defaultSorted triggers table to change which triggers query to elasticsearch
            // if remove defaultSorted, do not forget to uncomment this.update() in componentDidMount() function!!!
            defaultSorted={[
              {
                dataField: 'startDate',
                order: 'desc'
              }
            ]}
            onTableChange={ this.handleTableChange }
            pagination={ paginationFactory({ page: this.state.page, sizePerPage: this.state.pageSize, totalSize: this.state.total }) }
            noDataIndication={ () => <div>{ this.props.translate('pages.play.empty') }</div> }
            loading={ this.state.loading }
            overlay={ overlayFactory({ spinner: true, background: 'rgba(192,192,192,0.3)' }) }
            remote={{
              filter: true,
              pagination: true,
              sort: true,
              cellEdit: false
            }}
          />
        </div>

      </Fragment>
    )
  }
}


function mapStateToProps(state) {
  return {
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
    locale: _.find(state.locale.languages, (l) => l.active).code,
    esClient: state.elastic.client,
    withdrawApproved: state.event.withdrawApproved,
    txStatuses: state.tx.txStatuses,
  };
}

const mapDispatchToProps = {
  modalWithdrawShow
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerWithdraw);
