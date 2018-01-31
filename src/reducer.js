import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { localeReducer } from 'react-localize-redux';
import web3Reducer from './reducers/web3';
import userReducer from './reducers/user';
import tokenReducer from './reducers/token';

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  user: userReducer,
  token: tokenReducer,
  locale: localeReducer
});

export default reducer
