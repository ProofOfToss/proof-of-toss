import EventContract from '../../../build/contracts/Event.json';
import { getGasCalculation } from '../../util/gasPriceOracle';
import { deployed } from '../../util/contracts';
import { formatBalance, denormalizeBalance } from './../../util/token';

export const FETCHED_EVENT = 'FETCHED_EVENT';

export const FETCHING_ALLOWANCE = 'FETCHING_ALLOWANCE';
export const FETCHED_ALLOWANCE = 'FETCHED_ALLOWANCE';

export const APPROVING_EVENT = 'APPROVING_EVENT';
export const APPROVED_SUCCESS_EVENT = 'APPROVED_SUCCESS_EVENT';
export const APPROVED_ERROR_EVENT = 'APPROVED_ERROR_EVENT';

export const MODAL_NEW_BET_SHOW_EVENT = 'MODAL_NEW_BET_SHOW_EVENT';
export const MODAL_ADD_NEW_BET_CLOSE_EVENT = 'MODAL_ADD_NEW_BET_CLOSE_EVENT';
export const ADD_NEW_BET_ADDING_EVENT = 'ADD_NEW_BET_ADDING_EVENT';
export const ADD_NEW_BET_ADDED_EVENT = 'ADD_NEW_BET_ADDED_EVENT';

export const fetchEvent = (address) => {
  return async (dispatch, getState) => {
    const contract = require('truffle-contract');
    const event = contract(EventContract);
    event.setProvider(getState().web3.web3.currentProvider);
    const eventInstance = event.at(address);

    const endDate = await eventInstance.endDate();
    let eventData = {
      endDate: endDate
    };

    dispatch({type: FETCHED_EVENT, eventInstance: eventInstance, eventData: eventData});
  }
};

export const fetchAllowance = () => {
  return async (dispatch, getState) => {

    dispatch({type: FETCHING_ALLOWANCE});

    const {tokenInstance} = await deployed(getState().web3.web3, 'token');
    const allowance = await tokenInstance.allowance(getState().user.address, getState().event.eventInstance.address);

    dispatch({type: FETCHED_ALLOWANCE, allowance: formatBalance(allowance)});
  }
};

export const approve = (amount) => {
  return async (dispatch, getState) => {
    const denormalizeAmount = denormalizeBalance(amount);

    dispatch({type: APPROVING_EVENT, amount: amount});

    const web3 = getState().web3.web3;

    const tokenInstance = (await deployed(web3, 'token')).tokenInstance;

    const gasAmount = await tokenInstance.approve.estimateGas(getState().event.eventInstance.address, denormalizeAmount, {
      from: getState().user.address
    });

    const gasCalculation = await getGasCalculation(web3, gasAmount);

    await tokenInstance.approve(getState().event.eventInstance.address, denormalizeAmount, {
      from: getState().user.address,
      gasPrice: gasCalculation.gasPrice,
      gas: gasCalculation.gasLimit
    });

    dispatch({type: APPROVED_SUCCESS_EVENT, allowance: amount});
  }
};

export const newBet = (result, resultIndex, amount) => {
  return (dispatch, getState) => {
    dispatch({type: MODAL_NEW_BET_SHOW_EVENT, result: result, resultIndex: resultIndex, amount: amount});
  }
};

export const modalAddNewBetClose = () => ({
  type: MODAL_ADD_NEW_BET_CLOSE_EVENT
});

export const modalAddNewBetAdd = (gasLimit, gasPrice) => {
  return async (dispatch, getState) => {
    dispatch({type: ADD_NEW_BET_ADDING_EVENT});

    await getState().event.eventInstance.newBet(
      getState().event.newBetData.resultIndex,
      denormalizeBalance(getState().event.newBetData.amount),
      {
        from: getState().user.address,
        gasPrice: gasPrice,
        gas: gasLimit
      }
    );

    dispatch({type: ADD_NEW_BET_ADDED_EVENT});
  }
};
