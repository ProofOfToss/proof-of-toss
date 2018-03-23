import { AUTHENTICATE_USER, LOGOUT_USER, CHECK_WHITELIST } from '../actions/user';

const initialState = {
  'isAuthenticated': false,
  'address': null,
  'isWhitelisted': false
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATE_USER:
      return {
        ...state,
        'isAuthenticated': true,
        'address': action.address
      };

    case LOGOUT_USER:
      return {
        ...state,
        'isAuthenticated': false,
        'address': null,
        'isWhitelisted': false
      };

    case CHECK_WHITELIST:
      return {
        ...state,
        'isWhitelisted': action.is_whitelisted
      };

    default:
      return state;
  }
};

export default userReducer;
