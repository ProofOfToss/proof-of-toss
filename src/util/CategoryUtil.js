import config from "../data/config.json"

class CategoryUtil {

  constructor(translator) {
    this.translator = translator;
  }

  /**
   * @param id
   * @returns {string} Category name
   */
  getName(id) {
    this.category = undefined;
    this.findCategoryById(config.categories.list, id);

    if(undefined === this.category) {
      return '';
    }

    return this.translator(`categories.${this.category.name}`)
  }

  findCategoryById(categories, id) {
    return categories.forEach((category) => {

      if(category.children !== undefined) {
        this.findCategoryById(category.children, id);
      }

      if(category.id === parseInt(id, 10)) {
        this.category = category;
      }
    });
  }
}

export default CategoryUtil;