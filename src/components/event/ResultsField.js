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
      results: ["Result 1", "Result 2", "Result 3"]
    }
  }

  addResult() {
    this.setState({
      results: [...this.state.results, this.state.result]
    })
  }

  removeResult(key) {
    let results = this.state.results;
    results.splice(key, 1);
    this.setState({
      results: results
    })
  }

  moveResult(key) {
    console.log(key)
  }

  render() {
    const resultLink = Link.state(this, 'result')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}))
    ;

    return <Fragment>
      <ul>
        {this.state.results.map((result, key) => {
          return <li key={key}>
            {result}&nbsp;
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
      <div className={"form-group" + (resultLink.error ? ' has-error' : '')}>
        <label htmlFor="event[result]">{ this.props.translate('pages.new_event.form.results')}*</label>
        <div className="row">
          <div className="col-xs-8">
            <Input valueLink={ resultLink } type='text' id="event[result]" className='form-control' />
          </div>
          <div className="col-xs-4">
            <a className="btn btn-default" onClick={this.addResult}>{ this.props.translate('pages.new_event.form.results_add_new')}</a>
          </div>
        </div>
        <span id="helpBlock" className="help-block">{ resultLink.error || '' }</span>
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