import { refreshBalance } from './token'
import { checkWhitelist } from './user';

export const INIT_WEB3 = 'INIT_WEB3';
export const LOCK_WALLET = 'LOCK_WALLET';
export const UNLOCK_WALLET = 'UNLOCK_WALLET';
export const CHANGE_ADDRESS = 'CHANGE_ADDRESS';
export const WEB3_LOST_CONNECTION = 'WEB3_LOST_CONNECTION';
export const WEB3_NETWORK_CHANGED = 'WEB3_NETWORK_CHANGED';

export const initWeb3 = (web3) => ({
  'type': INIT_WEB3,
  'web3': web3
});

export const lockWallet = () => ({
  'type': LOCK_WALLET
});

export const unlockWallet = (currentAddress) => {
  return (dispatch, getState) => {
    dispatch({type: UNLOCK_WALLET, currentAddress: currentAddress});
    dispatch(refreshBalance(currentAddress));
    dispatch(checkWhitelist(currentAddress));
  };
};

export const changeAddress = (newAddress) => {
  return (dispatch, getState) => {
    dispatch({type: CHANGE_ADDRESS, newAddress: newAddress});
    dispatch(refreshBalance(newAddress));
    dispatch(checkWhitelist(newAddress));
  };
};

export const web3LostConnection = () => ({
  'type': WEB3_LOST_CONNECTION
});

export const web3NetworkChanged = (networkId) => ({
  'type': WEB3_NETWORK_CHANGED,
  'networkId': networkId,
});
