import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Link from 'valuelink'
import { Select } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import config from "../../data/config.json"

export const DEFAULT_CATEGORY = 1;

class CategoryField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {
        category: DEFAULT_CATEGORY
      },
      categories: []
    };
  }

  componentDidMount() {
    this.setState({
      categories: config.categories
    });
  }

  render() {
    const categoryLink = Link.state(this, 'formData').at('category')
      .check( v => v, this.props.translate('validation.required'))
      .onChange(v => {
        this.props.onChange({category: v});
      })
    ;

    return <div className={"form-group" + (categoryLink.error ? ' has-error' : '')}>
      {this.state.categories.length > 0 &&
        <Fragment>
          <label htmlFor="event[category]">{ this.props.translate('pages.new_event.form.category')}*</label>
          <Select valueLink={categoryLink} type='text' id="event[category]" className='form-control'
                  value={this.state.formData.category}>
            {this.state.categories.map((category, key) => {
              return <option key={key} value={category.id}>{this.props.translate(`categories.${category.name}`)}</option>
            }, this)}
          </Select>
          <span id="helpBlock" className="help-block">{ categoryLink.error || '' }</span>
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