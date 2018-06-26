import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import appConfig from "../../data/config.json"

class FilterCategories extends Component {

  constructor(props) {
    super(props);

    this.renderCategories = this.renderCategories.bind(this);
  }

  renderCategories(categories) {
    return categories.map((category, key) => {
      if(category.children !== undefined) {
        return this.renderCategories(category.children);
      }

      return <a
        key={category.name}
        className={this.props.activeCategory === category.id ? 'btn btn-default' : 'btn btn-link'}
        onClick={this.props.onChangeCategory.bind(this, category.id)}>
          {this.props.translate(`categories.${category.name}`)}
      </a>
    })
  }

  render() {
    return <div>
      <a className={this.props.activeCategory ? 'btn btn-link' : 'btn btn-default'}
         onClick={this.props.onChangeCategory.bind(this, null)}>{this.props.translate(`categories.all`)}</a>
      {this.renderCategories(appConfig.categories.list)}
    </div>
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  };
}

export default connect(mapStateToProps)(FilterCategories);