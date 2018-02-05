import { INIT_WEB3, LOCK_WALLET, UNLOCK_WALLET, CHANGE_ADDRESS, WEB3_LOST_CONNECTION } from '../actions/web3';

const initialState = {
  'web3': null,
  'currentAddress': null,
  'isWalletLocked': true,
  'hasConnection': true
};

function getCurrentAddress(web3) {
  return web3.eth.accounts.length > 0 ? web3.eth.accounts[0] : null;
}

function hasConnection(web3) {
  return web3.version.network !== 'loading';
}

function isWalletLocked(web3) {
  return web3.eth.accounts.length === 0;
}

const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_WEB3:
      return Object.assign({}, state, {
        'web3': action.web3,
        'web3Local': action.web3Local,
        'currentAddress': getCurrentAddress(action.web3),
        'isWalletLocked': isWalletLocked(action.web3),
        'hasConnection': hasConnection(action.web3)
      });

    case LOCK_WALLET:
      return Object.assign({}, state, {
        'isWalletLocked': true
      });

    case UNLOCK_WALLET:
      return Object.assign({}, state, {
        'currentAddress': action.currentAddress,
        'isWalletLocked': false
      });

    case CHANGE_ADDRESS:
      return Object.assign({}, state, {
        'currentAddress': getCurrentAddress(state.web3)
      });

    case WEB3_LOST_CONNECTION:
      return Object.assign({}, state, {
        'hasConnection': false
      });

    default:
      return state;
  }
};

export default web3Reducer;
