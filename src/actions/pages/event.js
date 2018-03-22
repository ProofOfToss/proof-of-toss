import EventContract from '../../../build/contracts/Event.json';
// import { getGasCalculation } from '../../util/gasPriceOracle';
// import { denormalizeBalance } from './../../util/token';
// import { deployed } from '../../util/contracts';

export const FETCHING_EVENT = 'FETCHING_EVENT';
export const FETCHED_EVENT = 'FETCHED_EVENT';
export const ADD_NEW_BET_EVENT = 'ADD_NEW_BET_EVENT';
export const NEW_BET_SAVED_EVENT = 'NEW_BET_SAVED_EVENT';

export const fetchEvent = (address) => {
  return (dispatch, getState) => {
    const contract = require('truffle-contract');
    const event = contract(EventContract);
    event.setProvider(getState().web3.web3.currentProvider);
    dispatch({type: FETCHED_EVENT, eventInstance: event.at(address)});
  }
};

export const newBet = (result) => {
  return (dispatch, getState) => {
    dispatch({type: ADD_NEW_BET_EVENT, result: result});

    // const web3 = getState().web3.web3;

    // deployed(web3, 'event').then(({eventInstance}) => {
    //   tokenInstance.approve.estimateGas(mainInstance.address, deposit, {
    //     from: getState().user.address
    //   })
    //   .then((gasAmount) => {
    //     return getGasCalculation(web3, gasAmount);
    //   })
    //   .then((gasCalculation) => {
    //     return tokenInstance.approve(mainInstance.address, deposit, {
    //       from: getState().user.address,
    //       gasPrice: gasCalculation.gasPrice,
    //       gas: gasCalculation.gasLimit
    //     });
    //   }).then(() => {
    //     dispatch({type: FORM_APPROVE_EVENT_SUCCESS});
    //   });
    // });
  }
};
