import { INITIALIZE, SET_ACTIVE_LANGUAGE } from 'react-localize-redux/lib/locale';
import moment from 'moment';
// import moment_locale_ru from 'moment/locale/ru';

const momentLocaleMiddleware = store => next => action => {
  if(action.type === INITIALIZE) {
    moment.locale(action.payload.options.defaultLanguage);
  }

  if(action.type === SET_ACTIVE_LANGUAGE) {
    //TODO::change the date format if locale changed?
  }

  next(action);
};

export default momentLocaleMiddleware;