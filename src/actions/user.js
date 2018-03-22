import { refreshBalance } from './token'

export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const LOGOUT_USER = 'LOGOUT_USER';

export const authenticateUser = (address) => {
  return (dispatch, getState) => {
    dispatch({type: AUTHENTICATE_USER, address: address});
    dispatch(refreshBalance(address));
  };
};

export const logoutUser = () => ({
  'type': LOGOUT_USER
});
