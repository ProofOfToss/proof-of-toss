import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Select } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import config from "../../data/config.json"

class CategoryField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: []
    };
  }

  componentDidMount() {
    this.setState({
      categories: config.categories.list
    });
  }

  render() {

    return <div className={"form-group" + (this.props.valueLink.error ? ' has-error' : '')}>
      {this.state.categories.length > 0 &&
        <Fragment>
          <label htmlFor="event[category]">{ this.props.translate('pages.new_event.form.category')}*</label>
          <Select valueLink={this.props.valueLink} type='text' id="event[category]" className='form-control'>
            {this.state.categories.map((category, key) => {
              return <option key={key} value={category.id}>{this.props.translate(`categories.${category.name}`)}</option>
            }, this)}
          </Select>
          <span id="helpBlock" className="help-block">{ this.props.valueLink.error || '' }</span>
        </Fragment>
      }
      </div>
    ;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(CategoryField);