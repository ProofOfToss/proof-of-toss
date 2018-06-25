import 'babel-polyfill';
import React, { Component } from 'react';
import Datetime from "react-datetime";
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import _ from "lodash";
const queryString = require('query-string');
import { Link, withRouter } from 'react-router';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import '../../styles/components/play_table.scss';

import appConfig from "../../data/config.json"
import { getLanguageAnalyzerByCode } from '../../util/i18n';

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
    this.onChangeLanguage = this.onChangeLanguage.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.isValidDate = this.isValidDate.bind(this);
    this.getUrlParams = this.getUrlParams.bind(this);
    this.update = this.update.bind(this);
    this.updateDebounce = this.updateDebounce.bind(this);

    this.dateStartRef = React.createRef();
    this.dateEndRef = React.createRef();
  }

  static defaultProps = {
    header: 'pages.play.header',
    routeName: '',
    refreshInterval: false,
    includeEndDateColumn: false,
    defaultSortField: 'startDate',
    defaultSortOrder: 'desc'
  };

  getUrlParams() {
    let params = {};

    ['q', 'locale', 'category', 'fromTimestamp', 'toTimestamp', 'page', 'sortField', 'sortOrder'].forEach((field) => {
      if (this.state[field]) {
        params[field] = this.state[field];
      }
    });

    return queryString.stringify(params);
  }

  getStateFromQueryString(props) {
    const parsed = props.location && props.location.search ? queryString.parse(props.location.search) : {};

    return {
      locale: parsed.locale ? parsed.locale:  props.locale,

      categories: appConfig.categories.list,
      languages: appConfig.languages.list,
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

    this.props.router.push(`/${this.props.locale}/${this.props.routeName}?${this.getUrlParams()}`);

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

  isValidDate(currentDate) {
    return currentDate.isSameOrAfter(Datetime.moment().add(BIDDING_END_MINUTES, 'minute'), 'day');
  }

  clearValueInDateTimeInput(ref) {
    ref.current.onInputChange({target: {value: ''}});
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
    }, () => {
      this.props.router.push(`/${this.props.locale}/${this.props.routeName}?${this.getUrlParams()}`);
      this.updateDebounce();
    });
  }

  onChangeToDate(toDate) {
    this.setState({
      toDate,
      toTimestamp: toDate ? parseInt(toDate.hour(23).minute(59).second(59).unix(), 10) : null,
      page: 1,
    }, () => {
      this.props.router.push(`/${this.props.locale}/${this.props.routeName}?${this.getUrlParams()}`);
      this.updateDebounce();
    });
  }

  onChangeQuery(e) {
    this.setState({
      q: e.target.value,
      page: 1,
    }, () => {
      this.props.router.push(`/${this.props.locale}/${this.props.routeName}?${this.getUrlParams()}`);
      this.updateDebounce();
    });
  }

  onChangeLanguage(e) {
    this.setState({
      locale: e.target.value,
      page: 1,
    }, () => {
      this.props.router.push(`/${this.props.locale}/${this.props.routeName}?${this.getUrlParams()}`);
      this.updateDebounce();
    });
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

    conditions.push({
      term: {
        locale: this.state.locale
      }
    });

    if(this.props.routeName !== 'admin/event_results') {
      conditions.push({
        range: {
          startDate: {
            gte: parseInt(Datetime.moment().add(BIDDING_END_MINUTES, 'minute').unix(), 10),
          }
        }
      });
    }

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
    let columns = [
      {
        text: this.props.translate('pages.play.columns.name'),
        dataField: "name",
        sort: false,
        classes: 'name col-md-4'
      },
      {
        text: this.props.translate('pages.play.columns.bid_type'),
        dataField: "bidType",
        sort: false,
        width: 200,
        classes: 'bid-type col-md-4'
      },
      {
        text: this.props.translate('pages.play.columns.start_date'),
        dataField: "startDate",
        sort: true,
        width: 200,
        formatter: (cell) => Datetime.moment(new Date(parseInt(cell, 10) * 1000)).format('LLL'),
      }
    ];

    if (this.props.includeEndDateColumn + '' === 'true') {
      columns.push({
        text: this.props.translate('pages.play.columns.end_date'),
        dataField: "endDate",
        sort: true,
        width: 200,
        formatter: (cell) => Datetime.moment(new Date(parseInt(cell, 10) * 1000)).format('LLL'),
      });
    }

    columns.push({
      text: this.props.translate('pages.play.columns.bid_sum'),
      dataField: "bidSum",
      sort: true,
      width: 150,
    });

    columns.push({
      text: '',
      dataField: 'address',
      sort: false,
      width: 100,
      formatter: (cell) => {
        return (this.props.routeName === 'admin/event_results') ?
          <Link to={`/${this.props.locale}/admin/event/${cell}`}>{ this.props.translate('pages.play.more') }</Link> :
          <Link to={`/${this.props.locale}/event/${cell}`}>{ this.props.translate('pages.play.more') }</Link>
      }
    });

    return(
      <div className="page-content page-content--play">
        <aside className="page-content__sidebar">
          <a className={this.state.category ? 'btn btn-link' : 'btn btn-default'} onClick={this.onChangeCategory.bind(this, null)}>{this.props.translate(`categories.all`)}</a>
          {
            categories.map((category, key) => <a
              key={key}
              className={this.state.category === category.id ? 'btn btn-default' : 'btn btn-link'}
              onClick={this.onChangeCategory.bind(this, category.id)}
            >{this.props.translate(`categories.${category.name}`)}</a>)
          }
        </aside>

        <main className="page-content__main">
          <form className="form play-form" onSubmit={this.handleSubmit}>

            <div className="row">
              <div className="col-md-5">
                <div className="form-group date-start">
                  <label htmlFor="event[date_start]">{ this.props.translate('pages.play.filters.from_date') }</label>
                  <Datetime
                    ref={this.dateStartRef}
                    value={this.state.fromDate}
                    timeFormat={false}
                    closeOnSelect={true}
                    onChange={this.onChangeFromDate}
                    isValidDate={this.isValidDate}
                    inputProps={{readOnly: true}} />
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
                  <label htmlFor="event[date_start]">{ this.props.translate('pages.play.filters.to_date') }</label>
                  <Datetime
                    ref={this.dateEndRef}
                    value={this.state.toDate}
                    timeFormat={false}
                    closeOnSelect={true}
                    onChange={this.onChangeToDate}
                    isValidDate={this.isValidDate}
                    inputProps={{readOnly: true}} />
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
              <div className="col-md-2">
                <div className="input-group">
                  <label htmlFor="event[locale]">{ this.props.translate('pages.play.filter.locale') }</label>
                  <select id="event[locale]" className="form-control" value={this.state.locale} onChange={this.onChangeLanguage}>
                    {
                      appConfig.languages.list.map((language, key) => {
                        return <option key={language.code} value={language.code}>{this.props.translate('language.' + language.code)}</option>
                      })
                    }
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <label htmlFor="event[locale]">{ this.props.translate('pages.play.filter.search') }</label>
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
              columns={ columns }
              // @todo: defaultSorted triggers table to change which triggers query to elasticsearch
              // if remove defaultSorted, do not forget to uncomment this.update() in componentDidMount() function!!!
              defaultSorted={[
                {
                  dataField: this.props.defaultSortField,
                  order: this.props.defaultSortOrder
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
        </main>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale),
    locale: _.find(state.locale.languages, (l) => l.active).code,
    esClient: state.elastic.client,
  };
}

export default withRouter(connect(mapStateToProps)(Index));
