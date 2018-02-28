import { REFRESH_BALANCE } from '../actions/token';

const initialState = {
  'balance': 0,
  'blockedBalance': 0,
  'sbtcBalance': 0
};

const tokenReducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_BALANCE:
      return Object.assign({}, state, {
        'balance': action.balance,
        'blockedBalance': action.blockedBalance,
        'sbtcBalance': action.sbtcBalance
      });
    default:
      return state;
  }
};

export default tokenReducer;
