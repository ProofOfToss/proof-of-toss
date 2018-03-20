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

const LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE = 'LOCAL_STORAGE_KEY_PLAY_PAGE_SIZE';
const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const BIDDING_END_MINUTES = 11;

class Index extends Component {
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
    this.setState(this.getStateFromQueryString(nextProps));
  }

  componentDidMount() {
    this.update();
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
    return currentDate.isSameOrAfter(Datetime.moment().add(BIDDING_END_MINUTES, 'minute'), 'day');
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

    history.replaceState({}, '', `/${this.props.locale}/play?${this.getUrlParams()}`);

    conditions.push({
      term: {
        locale: this.props.locale
      }
    });

    conditions.push({
      range: {
        startDate: {
          gte: parseInt(Datetime.moment().add(BIDDING_END_MINUTES, 'minute').unix(), 10),
        }
      }
    });

    if (this.state.q) {
      shouldConditions.push({
        query_string: {
          fields: ['name', 'description'],
          query: this.state.q
        }
      });

      shouldConditions.push({
        "nested": {
          "path": "tag",
          "query": {
            query_string: {
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

      this.setState({
        data: _.map(res.hits.hits, '_source'),
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
              keyField="address"
              data={ data }
              columns={ [
                {
                  text: this.props.translate('pages.play.columns.name'),
                  dataField: "name",
                  sort: false,
                },
                {
                  text: this.props.translate('pages.play.columns.tags'),
                  dataField: "tag",
                  sort: false,
                  formatter: (tags) => _.map(tags, 'name').join(', '),
                },
                {
                  text: this.props.translate('pages.play.columns.bid_type'),
                  dataField: "bidType",
                  sort: false,
                  width: 200,
                },
                {
                  text: this.props.translate('pages.play.columns.start_date'),
                  dataField: "startDate",
                  sort: true,
                  width: 200,
                  formatter: (cell) => Datetime.moment(new Date(parseInt(cell, 10) * 1000)).format('LLL'),
                },
                {
                  text: this.props.translate('pages.play.columns.bid_sum'),
                  dataField: "bidSum",
                  sort: true,
                  width: 150,
                },
                {
                  text: '',
                  dataField: 'address',
                  sort: false,
                  width: 100,
                  formatter: (cell) => {
                    return <Link to={`/${this.props.locale}/event/${cell}`}>{ this.props.translate('pages.play.more') }</Link>
                  }
                }
              ] }
              defaultSorted={[
                {
                  dataField: 'bidSum',
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
    translate: getTranslate(state.locale),
    locale: _.first(state.locale.languages, (l) => l.active).code,
    esClient: state.elastic.client,
  };
}

export default connect(mapStateToProps)(Index);
