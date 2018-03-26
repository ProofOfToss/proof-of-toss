import { getMyBalance, getMyBlockedBalance, getMySBTCBalance } from './../util/token'

export const REFRESH_BALANCE = 'REFRESH_BALANCE';

export const refreshBalanceAction = (balance, blockedBalance, sbtcBalance) => ({
  'type': REFRESH_BALANCE,
  balance,
  blockedBalance,
  sbtcBalance
});

export const refreshBalance = (address) => {
  return function (dispatch, getState) {
    if (!getState().web3 || !getState().web3.web3) {
      return Promise.resolve();
    }

    let web3 = getState().web3.web3;

    let balance, blockedBalance;

    return getMyBalance(web3, address).then((_balance) => {
        balance = _balance;

        return getMyBlockedBalance(web3, address);
      })
      .then((_blockedBalance) => {
        blockedBalance = _blockedBalance;

        return getMySBTCBalance(web3, address);
      })
      .then((sbtcBalance) => {
        dispatch(refreshBalanceAction(balance, blockedBalance, sbtcBalance));
      });
  };
};
