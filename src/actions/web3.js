import { refreshBalance } from './token'

export const INIT_WEB3 = 'INIT_WEB3';
export const LOCK_WALLET = 'LOCK_WALLET';
export const UNLOCK_WALLET = 'UNLOCK_WALLET';
export const CHANGE_ADDRESS = 'CHANGE_ADDRESS';
export const WEB3_LOST_CONNECTION = 'WEB3_LOST_CONNECTION';

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
  };
};

export const changeAddress = (newAddress) => {
  return (dispatch, getState) => {
    dispatch({type: CHANGE_ADDRESS, newAddress: newAddress});
    dispatch(refreshBalance(newAddress));
  };
};

export const web3LostConnection = () => ({
  'type': WEB3_LOST_CONNECTION
});
