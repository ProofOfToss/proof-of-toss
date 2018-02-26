import { REFRESH_BALANCE } from '../actions/token';

const initialState = {
  'balance': 0,
  'blockedBalance': 0,
  'sbtcBalance': 0,
  'decimals': 4
};

const tokenReducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_BALANCE:
      return Object.assign({}, state, {
        'balance': action.balance,
        'blockedBalance': action.blockedBalance,
        'sbtcBalance': action.sbtcBalance,
        'decimals': action.decimals
      });
    default:
      return state;
  }
};

export default tokenReducer;
