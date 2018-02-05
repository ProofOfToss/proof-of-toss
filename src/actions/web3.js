export const INIT_WEB3 = 'INIT_WEB3';
export const LOCK_WALLET = 'LOCK_WALLET';
export const UNLOCK_WALLET = 'UNLOCK_WALLET';
export const CHANGE_ADDRESS = 'CHANGE_ADDRESS';
export const WEB3_LOST_CONNECTION = 'WEB3_LOST_CONNECTION';

export const initWeb3 = (web3, web3Local) => ({
  'type': INIT_WEB3,
  'web3': web3,
  'web3Local': web3Local
});

export const lockWallet = () => ({
  'type': LOCK_WALLET
});

export const unlockWallet = (currentAddress) => ({
  'type': UNLOCK_WALLET,
  'currentAddress': currentAddress
});

export const changeAddress = (newAddress) => ({
  'type': CHANGE_ADDRESS,
  'newAddress': newAddress
});

export const web3LostConnection = () => ({
  'type': WEB3_LOST_CONNECTION
});
