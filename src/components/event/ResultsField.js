import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Input } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';

const MOVE_UP = 1;
const MOVE_DOWN = 1;

class ResultsField extends Component {

  constructor(props) {
    super(props);

    this.addResult = this.addResult.bind(this);
    this.removeResult = this.removeResult.bind(this);
    this.moveResult = this.moveResult.bind(this);

    this.state = {
      result: '',
      resultCoefficient: '',
      results: []
    };
  }

  addResult() {
    if(this.resultLink.error !== undefined || this.resultLinkCoefficient.error !== undefined) {
      return;
    }

    const results = [...this.state.results, {name: this.state.result, coefficient: this.state.resultCoefficient}];

    this.setState({
      results: results
    });

    this.props.onChange({results: results})
  }

  removeResult(key) {
    let results = this.state.results;
    results.splice(key, 1);
    this.setState({
      results: results
    });

    this.props.onChange({results: results});
  }

  moveResult(key) {
    console.log(key)
  }

  render() {

    this.resultLink = Link.state(this, 'result')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}))
    ;

    this.resultLinkCoefficient = Link.state(this, 'resultCoefficient')
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.range', {min: 1, max: 99}))
      .check( v => parseFloat(v) <= 99, this.props.translate('validation.range', {min: 1, max: 99}))
    ;

    return <Fragment>
      <div className={"form-group" + (this.resultLink.error || this.resultLinkCoefficient.error ? ' has-error' : '')}>
        <label htmlFor="event[result]">{ this.props.translate('pages.new_event.form.results')}*</label>
        <ul>
          {this.state.results.map((result, key) => {
            return <li key={key}>
              {result.name}&nbsp;{result.coefficient}&nbsp;
              <a className="btn btn-default btn-xs" onClick={() => {this.removeResult(key)}}>
                { this.props.translate('pages.new_event.form.results_remove')}
              </a>&nbsp;
              <a className="btn btn-default btn-xs" onClick={() => {this.moveResult(MOVE_UP, key)}}>
                { this.props.translate('pages.new_event.form.results_move_up')}
              </a>&nbsp;
              <a className="btn btn-default btn-xs" onClick={() => {this.moveResult(MOVE_DOWN, key)}}>
                { this.props.translate('pages.new_event.form.results_move_down')}
              </a>
            </li>
          }, this)}
        </ul>
        <div className="row">
          <div className="col-xs-6">
            <Input valueLink={ this.resultLink } type='text' id="event[result]" className='form-control' />
            <span id="helpBlock" className="help-block">{ this.resultLink.error || '' }</span>
          </div>
          <div className="col-xs-2">
            <Input valueLink={ this.resultLinkCoefficient } type='number' id="event[result_coefficient]" className='form-control' />
            <span id="helpBlock" className="help-block">{ this.resultLinkCoefficient.error || '' }</span>
          </div>
          <div className="col-xs-4">
            <a className="btn btn-default" onClick={this.addResult}>{ this.props.translate('pages.new_event.form.results_add_new')}</a>
          </div>
        </div>
      </div>
    </Fragment>
    ;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(ResultsField);