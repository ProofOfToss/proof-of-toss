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
        return <div className="categories-filter__item-container">
          <a className="categories-filter__item categories-filter__item_level-1">
            <span className={`icon categories-filter__item-icon categories-filter__item-icon_category-${category.name}`} />
            <span className="categories-filter__item-name">{this.props.translate(`categories.${category.name}`)}</span>
          </a>
          <div className="categories-filter__dropdown">
            {this.renderCategories(category.children)}
          </div>
        </div>
      }

      return <a
        key={category.name}
        className={this.props.activeCategory === category.id ?
          'categories-filter__item categories-filter__item_level-2 categories-filter__item-selected' :
          'categories-filter__item categories-filter__item_level-2'}
        onClick={this.props.onChangeCategory.bind(this, category.id)}>
          {this.props.translate(`categories.${category.name}`)}
      </a>
    })
  }

  render() {
    return <div className="categories-filter">
      {/*<a*/}
        {/*className={this.props.activeCategory ? 'categories-filter' :*/}
          {/*'categories-filter__item categories-filter_item-selected'}*/}
         {/*onClick={this.props.onChangeCategory.bind(this, null)}>{this.props.translate(`categories.all`)}</a>*/}
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