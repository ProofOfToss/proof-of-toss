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
    const category = config.categories.list.find((category) => {
      return category.id === parseInt(id, 10);
    });

    if(undefined === category) {
      return '';
    }

    return this.translator(`categories.${category.name}`)
  }
}

export default CategoryUtil;