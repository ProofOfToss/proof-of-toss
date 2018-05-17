import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Input } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';

const MOVE_UP = 1;
const MOVE_DOWN = 2;

class ResultsField extends Component {

  constructor(props) {
    super(props);

    this.addResult = this.addResult.bind(this);
    this.removeResult = this.removeResult.bind(this);
    this.moveResult = this.moveResult.bind(this);

    this.state = {
      result: '',
      resultCoefficient: '',
      showResultErrors: false,
      results: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.saved) {
      this.setState({
        results: []
      });
    }
  }

  addResult() {
    if(this.resultLink.error !== undefined || this.resultLinkCoefficient.error !== undefined) {
      this.setState({
        showResultErrors: true
      });
      return;
    }

    const results = [...this.state.results, {description: this.state.result, coefficient: this.state.resultCoefficient}];

    this.setState({
      result: '',
      resultCoefficient: '',
      showResultErrors: false,
      results: results
    });

    this.props.onChange({results: results})
  }

  removeResult(key) {
    let results = this.state.results;
    results.splice(key, 1);
    this.setState({
      showResultErrors: false,
      results: results
    });

    this.props.onChange({results: results});
  }

  moveResult(direction, key) {
    let results = this.state.results;

    results.splice(direction === MOVE_DOWN ? key + 1 : key - 1, 0, results.splice(key, 1)[0]);

    this.setState({
      results: results
    });
  }

  render() {

    this.resultLink = Link.state(this, 'result')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.min_length', {min: 3}));

    this.resultLinkCoefficient = Link.state(this, 'resultCoefficient');

    if (this.props.isOperatorEvent) {
      this.resultLinkCoefficient.check(v => parseFloat(v) >= 1, this.props.translate('validation.range', {min: 1, max: 99}));
      this.resultLinkCoefficient.check(v => parseFloat(v) <= 99, this.props.translate('validation.range', {min: 1, max: 99}));
    }

    return <Fragment>
      <div className="form-group">
        <label htmlFor="event[result]">{ this.props.translate('pages.new_event.form.results.label')}*</label>
        <div className="container">
          {this.state.results.map((result, key) => {
            return <div className="row bottom-margin-5" key={key}>
              <div className="col-xs-1">{result.description}</div>
              <div className="col-xs-1">{result.coefficient}</div>
              <div className="col-xs-1">
                <a className="btn btn-default btn-xs" onClick={() => {this.removeResult(key)}}>
                  { this.props.translate('pages.new_event.form.results.remove')}
                </a>
              </div>
              <div className="col-xs-1">
                {key !== 0 &&
                  <Fragment>
                    <a className="btn btn-default btn-xs" onClick={() => {
                      this.moveResult(MOVE_UP, key)
                    }}>
                      {this.props.translate('pages.new_event.form.results.move_up')}
                    </a>&nbsp;
                  </Fragment>
                }
              </div>
              <div className="col-xs-1">
                {key !== this.state.results.length - 1 &&
                  <a className="btn btn-default btn-xs" onClick={() => {
                    this.moveResult(MOVE_DOWN, key)
                  }}>
                    {this.props.translate('pages.new_event.form.results.move_down')}
                  </a>
                }
              </div>
            </div>
          }, this)}
        </div>
        <div className="row">
          <div className={"col-xs-6" + (this.resultLink.error && this.state.showResultErrors ? ' has-error' : '')}>
            <Input valueLink={ this.resultLink } type='text' id="event[result]" className='form-control'
                   placeholder={this.props.translate('pages.new_event.form.results.name')} />
            {this.resultLink.error && this.state.showResultErrors &&
              <span id="helpBlock" className="help-block">{ this.resultLink.error || '' }</span>
            }
          </div>
          {
            this.props.isOperatorEvent
              ? <div className={"col-xs-2" + (this.resultLinkCoefficient.error && this.state.showResultErrors ? ' has-error' : '')}>
                <Input valueLink={ this.resultLinkCoefficient } type='number' id="event[result_coefficient]" className='form-control'
                       placeholder={this.props.translate('pages.new_event.form.results.coefficient')}/>
                {this.resultLinkCoefficient.error && this.state.showResultErrors &&
                <span id="helpBlock" className="help-block">{this.resultLinkCoefficient.error || ''}</span>
                }
              </div>
              : null
          }
          <div className="col-xs-4">
            <a className="btn btn-default" onClick={this.addResult}>{ this.props.translate('pages.new_event.form.results.add_new')}</a>
          </div>
        </div>
        {this.state.results.length < 2 && this.props.showErrors &&
          <div className="has-error">
            <span id="helpBlock" className="help-block">{ this.props.translate('pages.new_event.form.results.error')}</span>
          </div>
        }
      </div>
    </Fragment>
    ;
  }
}

function mapStateToProps(state) {
  return {
    saved: state.newEvent.saved,
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(ResultsField);