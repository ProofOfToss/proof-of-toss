import { initialize } from 'react-localize-redux';
import { addTranslationForLanguage } from 'react-localize-redux';
import config from "../../data/config.json"

export default function init(dispatch, defaultLanguage) {
  dispatch(initialize(config.languages.list, { defaultLanguage: defaultLanguage }));

  config.languages.list.forEach(function (element) {
    dispatch(addTranslationForLanguage(require(`./${element.code}.json`), element.code));
  })
}