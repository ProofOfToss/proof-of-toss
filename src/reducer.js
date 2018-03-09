import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { localeReducer } from 'react-localize-redux';
import web3Reducer from './reducers/web3';
import userReducer from './reducers/user';
import tokenReducer from './reducers/token';
import newEventReducer from './reducers/pages/newEvent';
import WalletReducer from './reducers/pages/wallet';

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  user: userReducer,
  token: tokenReducer,
  locale: localeReducer,
  newEvent: newEventReducer,
  wallet: WalletReducer
});

export default reducer
