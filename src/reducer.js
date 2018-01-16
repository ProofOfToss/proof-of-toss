import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import web3Reducer from './reducers/web3';
import userReducer from './reducers/user';

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  user: userReducer
});

export default reducer
