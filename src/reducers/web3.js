import { INIT_WEB3, LOCK_WALLET, UNLOCK_WALLET, CHANGE_ADDRESS } from '../actions/web3';

const initialState = {
  'web3': null,
  'currentAddress': null,
  'isWalletLocked': true
};

const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_WEB3:
      return {
        'web3': action.web3,
        'currentAddress': action.web3.eth.accounts.length > 0 ? action.web3.eth.accounts[0] : null,
        'isWalletLocked': action.web3.eth.accounts.length === 0
      };

    case LOCK_WALLET:
      return {
        'isWalletLocked': true
      };

    case UNLOCK_WALLET:
      return {
        'isWalletLocked': false,
        'currentAddress': action.currentAddress
      };

    case CHANGE_ADDRESS:
      return {
        'currentAddress': action.newAddress
      };

    default:
      return state;
  }
};

export default web3Reducer;
