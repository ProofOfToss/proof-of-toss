import 'babel-polyfill';
import React, { Component } from 'react';
import Datetime from "react-datetime";
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import _ from "lodash";
const queryString = require('query-string');
import { Link } from 'react-router';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import '../../styles/components/play_table.scss';

import appConfig from "../../data/config.json"
import { getLanguageAnalyzerByCode } from '../../util/i18n';
import { denormalizeBalance } from '../../util/token';

const LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE = 'LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE';
const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const BET_INDEX = 'toss_bet_' + appConfig.elasticsearch.indexPostfix;

class MyBets extends Component {
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
  }

  getUrlParams() {
    let params = {};

    ['q', 'category', 'fromTimestamp', 'toTimestamp', 'page', 'sortField', 'sortOrder'].forEach((field) => {
      if (this.state[field]) {
        params[field] = this.state[field];
      }
    });

    return queryString.stringify(params);
  }

  getStateFromQueryString(props) {
    const parsed = queryString.parse(props.location.search);

    return {
      locale: props.locale,

      categories: appConfig.categories.list,
      data: [],

      loading: true,
      error: null,

      q: parsed.q,
      category: parsed.category ? parseInt(parsed.category, 10) : null,
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
      fromTimestamp: fromDate ? parseInt(fromDate.unix(), 10) : null,
      page: 1,
    }, this.update);
  }

  onChangeToDate(toDate) {
    this.setState({
      toDate,
      toTimestamp: toDate ? parseInt(toDate.unix(), 10) : null,
      page: 1,
    }, this.update);
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
    const conditions = [];
    const shouldConditions = [];

    history.replaceState({}, '', `/${this.state.locale}/cabinet/my_bets?${this.getUrlParams()}`);

    conditions.push({
      term: {
        locale: this.state.locale
      }
    });

    conditions.push({
      term: {
        'bettor': this.props.currentAddress,
      }
    });

    if (this.state.q) {
      shouldConditions.push({
        query_string: {
          analyzer: getLanguageAnalyzerByCode(this.props.locale),
          fields: ['name', 'description'],
          query: this.state.q
        }
      });

      shouldConditions.push({
        "nested": {
          "path": "tag",
          "query": {
            query_string: {
              analyzer: getLanguageAnalyzerByCode(this.props.locale),
              fields: ['tag.name'],
              query: this.state.q
            }
          }
        }
      });

    }

    if (this.state.category) {
      conditions.push({
        term: {
          category: this.state.category,
        }
      });
    }

    if (this.state.fromTimestamp || this.state.toTimestamp) {
      const condition = {};

      if (this.state.fromTimestamp) { condition.gte = this.state.fromTimestamp; }
      if (this.state.toTimestamp) { condition.lte = this.state.toTimestamp; }

      conditions.push({
        range: {
          startDate: condition
        }
      });
    }

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

      const bidsRes = await this.props.esClient.search(Object.assign({
        index: BET_INDEX,
        sort: `timestamp:desc`,
        body: {
          query: {
            bool: {
              must: [
                {
                  terms: {
                    'event': res.hits.hits.map((hit) => hit._id),
                  }
                }
              ]
            }
          }
        }
      }));

      const bidsByEvents = _.groupBy(_.map(bidsRes.hits.hits, (res) => {
        return Object.assign({tx: res._id}, res._source)
      }), 'event');
      const emptyEvent = {
        'name': '',
        'description': '',
        'bidType': '',
        'bidSum': '',
        'address': '',
        'createdBy': '',
        'locale': '',
        'category': '',
        'startDate': '',
        'endDate': '',
        'sourceUrl': '',
        'tag': '',
        'result': '',
      };

      const bidInfo = (bid, event) => {
        const bidResult = event.possibleResults[bid.result];
        const coefficient = bidResult.customCoefficient > 0 ? bidResult.customCoefficient : bid.amount / bidResult.betSum;

        return {
          tx: bid.tx,
          isWinningBet: event.result === bid.result,
          bidResult: bidResult.description,
          bidSum: bid.amount,
          bidDate: bid.timestamp,
          coefficient: coefficient,
          prize: event.result === bid.result ? bid.amount * coefficient : 0,
        };
      };

      const data = _.map(res.hits.hits, '_source').reduce(
        (accumulator, event) => {
          const bids = bidsByEvents[event.address];
          const bidsLength = bids.length;
          accumulator.push(Object.assign({rowSpan: bidsLength}, event, bidInfo(bids[0], event)));

          for (let i = 1; i < bidsLength; i++) {
            accumulator.push(Object.assign({rowSpan: 0}, emptyEvent, bidInfo(bids[i], event)));
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
  }

  render() {
    const { data, categories } = this.state;

    const rowStyle = (row, rowIndex) => {
      return row.isWinningBet ? { background: 'rgba(255, 200, 200, 1)' } : {};
    };

    const rowAttrs = (cell, row, rowIndex, colIndex) => {
      return {rowSpan: row.rowSpan};
    };

    return(
      <main className="container">
        <div>
          <h1>{ this.props.translate('pages.play.header') }</h1>

          <div>
            <a className={this.state.category ? 'btn btn-link' : 'btn btn-default'} onClick={this.onChangeCategory.bind(this, null)}>{this.props.translate(`categories.all`)}</a>
            {
              categories.map((category, key) => <a
                key={key}
                className={this.state.category === category.id ? 'btn btn-default' : 'btn btn-link'}
                onClick={this.onChangeCategory.bind(this, category.id)}
              >{this.props.translate(`categories.${category.name}`)}</a>)
            }
          </div>

          <form className="form" onSubmit={this.handleSubmit}>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_start') }</label>
                  <Datetime value={this.state.fromDate} timeFormat={false} closeOnSelect={true} onChange={this.onChangeFromDate} isValidDate={this.isValidDate} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="event[date_start]">{ this.props.translate('pages.play.columns.date_end') }</label>
                  <Datetime value={this.state.toDate} timeFormat={false} closeOnSelect={true} onChange={this.onChangeToDate} isValidDate={this.isValidDate} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-group">
                  <input type="text" className="form-control" value={this.state.q} placeholder={ this.props.translate('pages.play.search') } onChange={this.onChangeQuery} />
                </div>
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
                    const category = _.find(categories, (cat) => cat.id === parseInt(categoryId));

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
                  sort: true,
                  width: 150,
                },
                {
                  text: this.props.translate('pages.play.columns.bid_sum'),
                  dataField: "bidSum",
                  sort: true,
                  width: 150,
                  formatter: (cell) => denormalizeBalance(cell),
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
                },
                {
                  text: this.props.translate('pages.play.columns.prize'),
                  dataField: "prize",
                  sort: false,
                  width: 200,
                  formatter: (cell) => denormalizeBalance(cell),
                },
                {
                  text: '',
                  dataField: 'address',
                  sort: false,
                  width: 100,
                  formatter: (cell) => {
                    return <Link to={`/${this.state.locale}/event/${cell}`}>{ this.props.translate('pages.play.more') }</Link>
                  }
                }
              ] }
              rowStyle={ rowStyle }
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
        </div>
      </main>
    )
  }
}


function mapStateToProps(state) {
  return {
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
    locale: _.find(state.locale.languages, (l) => l.active).code,
    esClient: state.elastic.client,
  };
}

export default connect(mapStateToProps)(MyBets);
