import { refreshBalance } from './token'
import { deployed } from '../util/contracts';
import config from "../data/config.json";

export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const CHECK_WHITELIST = 'CHECK_WHITELIST';

export const checkWhitelist = (address) => {
  return async (dispatch, getState) => {
    if (!getState().web3 || !getState().web3.web3) {
      return Promise.resolve();
    }

    const main = (await deployed(getState().web3.web3, 'main')).mainInstance;
    const isWhitelisted = await main.whitelist(address);
    const isWhitelistedLocally = config.whitelist.indexOf(address) >= 0;

    if (isWhitelistedLocally !== isWhitelisted) {
      console.log('Sync whitelist!');
    }

    dispatch({type: CHECK_WHITELIST, is_whitelisted: isWhitelisted});
  }
};

export const authenticateUser = (address) => {
  return (dispatch, getState) => {
    dispatch({type: AUTHENTICATE_USER, address: address});
    dispatch(refreshBalance(address));
    dispatch(checkWhitelist(address));
  };
};

export const logoutUser = () => ({
  'type': LOGOUT_USER
});
