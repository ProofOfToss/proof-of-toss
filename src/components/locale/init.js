import store from '../../store';
import { initialize } from 'react-localize-redux';
import { addTranslationForLanguage } from 'react-localize-redux';
import config from "../../data/config.json"

export default function init() {
  store.dispatch(initialize(config.languages.list));

  config.languages.list.forEach(function (element) {
    store.dispatch(addTranslationForLanguage(require(`./${element.code}.json`), element.code));
  })
}