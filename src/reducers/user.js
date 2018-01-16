import { AUTHENTICATE_USER, LOGOUT_USER } from '../actions/user';

const initialState = {
  'isAuthenticated': false,
  'address': null
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATE_USER:
      return {
        'isAuthenticated': true,
        'address': action.address
      };

    case LOGOUT_USER:
      return {
        'isAuthenticated': false,
        'address': null
      };

    default:
      return state;
  }
};

export default userReducer;
