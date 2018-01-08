import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
//import userReducer from './user/userReducer'

const reducer = combineReducers({
  routing: routerReducer
})

export default reducer
