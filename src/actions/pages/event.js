import EventBaseContract from '../../../build/contracts/EventBase.json';
import { getTranslate } from 'react-localize-redux';
import { deployed } from "../../util/contracts";
import { formatBalance, denormalizeBalance } from './../../util/token';
import { toBytesTruffle as toBytes } from '../../util/serialityUtil';
import appConfig from "../../data/config.json";

export const FETCHED_EVENT = 'FETCHED_EVENT';
export const FETCHING_ERROR_EVENT = 'FETCHING_ERROR_EVENT';
export const RESET_EVENT = 'RESET_EVENT';

export const MODAL_NEW_BET_SHOW_EVENT = 'MODAL_NEW_BET_SHOW_EVENT';
export const MODAL_ADD_NEW_BET_CLOSE_EVENT = 'MODAL_ADD_NEW_BET_CLOSE_EVENT';
export const ADD_NEW_BET_ADDING_EVENT = 'ADD_NEW_BET_ADDING_EVENT';
export const ADD_NEW_BET_ADDED_EVENT = 'ADD_NEW_BET_ADDED_EVENT';
export const ADD_NEW_BET_ERROR_EVENT = 'ADD_NEW_BET_ERROR_EVENT';

export const MODAL_RESOLVE_SHOW_EVENT = 'MODAL_RESOLVE_SHOW_EVENT';
export const MODAL_RESOLVE_CLOSE_EVENT = 'MODAL_RESOLVE_CLOSE_EVENT';
export const MODAL_RESOLVE_APPROVING_EVENT = 'MODAL_RESOLVE_APPROVING_EVENT';
export const MODAL_RESOLVE_APPROVED_EVENT = 'MODAL_RESOLVE_APPROVED_EVENT';
export const MODAL_RESOLVE_APPROVE_ERROR_EVENT = 'MODAL_RESOLVE_APPROVE_ERROR_EVENT';

export const MODAL_WITHDRAW_SHOW_EVENT = 'MODAL_WITHDRAW_SHOW_EVENT';
export const MODAL_WITHDRAW_CLOSE_EVENT = 'MODAL_WITHDRAW_CLOSE_EVENT';
export const MODAL_WITHDRAW_APPROVING_EVENT = 'MODAL_WITHDRAW_APPROVING_EVENT';
export const MODAL_WITHDRAW_APPROVED_EVENT = 'MODAL_WITHDRAW_APPROVED_EVENT';
export const MODAL_WITHDRAW_APPROVE_ERROR_EVENT = 'MODAL_WITHDRAW_APPROVE_ERROR_EVENT';

export const DID_NOT_HAPPEN_EVENT = 'DID_NOT_HAPPEN_EVENT';

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;

export const fetchEvent = (address) => {
  return async (dispatch, getState) => {

    try {
      const eventEs = await getState().elastic.client.get({
        index: EVENT_INDEX,
        type: 'event',
        id: address
      });

      if(false === eventEs.found) {
        dispatch({type: FETCHING_ERROR_EVENT, error: eventEs});
      }

      let eventData = eventEs._source;

      //Load results from blockchain and merge them to eventData object
      const contract = require('truffle-contract');
      const eventBase = contract(EventBaseContract);
      eventBase.setProvider(getState().web3.web3.currentProvider);
      const eventBaseInstance = eventBase.at(address);

      //Fetch state
      eventData.status = (await eventBaseInstance.getState()).toNumber();
      eventData.resolvedResult = (await eventBaseInstance.resolvedResult()).toNumber();

      //Fetch results
      let resultsPromises = [];
      const countResults = (await eventBaseInstance.resultsCount()).toNumber();
      for(let i = 0; i < countResults; i++) {
        resultsPromises.push(eventBaseInstance.possibleResults(i));
      }

      Promise.all(resultsPromises).then((results) => {
        for(let i = 0; i < results.length; i++) {
          let esResult = eventData.possibleResults.find((result) => {
            return result.index === i;
          });

          Object.assign(esResult, {
            coefficient: results[esResult.index][0].toNumber(),
            betCount: results[esResult.index][1].toNumber(),
            betSum: formatBalance(results[esResult.index][2].toNumber()),
            resolved: false
          });

          if(esResult.index === eventData.resolvedResult) {
            esResult.resolved = true;
            eventData.resolvedResultDescription = esResult.description;
          }

          delete(esResult.customCoefficient);
        }

        dispatch({type: FETCHED_EVENT, eventData: eventData});
      });
    } catch (e) {
      console.log(e);
      dispatch({type: FETCHING_ERROR_EVENT, error: e});
    }
  }
};

export const resetEvent = () => ({
  type: RESET_EVENT
});

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

    const tokenInstance = (await deployed(getState().web3.web3, 'token')).tokenInstance;

    try {
      await tokenInstance.transferToContract(
        getState().event.eventData.address,
        denormalizeBalance(getState().event.newBetData.amount),
        toBytes(
          {type: 'uint', size: 8, value: 1}, // action – bet
          {type: 'uint', size: 8, value: getState().event.newBetData.resultIndex}, // result index
        ),
        {
          from: getState().user.address,
          gasPrice: gasPrice,
          gas: gasLimit
        }
      );

      dispatch({type: ADD_NEW_BET_ADDED_EVENT});
    } catch (e) {
      let msg;
      const translate = getTranslate(getState().locale);
      if (
        // firefox do not have normal msg, so trying to check for method name in call stack
        e.message.indexOf('nsetTxStatusRejected') !== -1 ||
      // chrome have normal message
        e.message.indexOf('User denied transaction signature') !== -1)
      {
        msg = translate('errors.denied_transaction');
      } else {
        msg = translate('errors.unexpected_error');
      }

      dispatch({type: ADD_NEW_BET_ERROR_EVENT, error: msg});
    }
  }
};

export const modalResolveShow = (result) => ({
  type: MODAL_RESOLVE_SHOW_EVENT,
  result: result
});

export const modalResolveClose = (result) => ({
  type: MODAL_RESOLVE_CLOSE_EVENT
});

export const modalResolveApprove = (gasLimit, gasPrice) => {
  return async (dispatch, getState) => {
    dispatch({type: MODAL_RESOLVE_APPROVING_EVENT});

    try {
      const contract = require('truffle-contract');
      const eventBase = contract(EventBaseContract);
      eventBase.setProvider(getState().web3.web3.currentProvider);
      const eventBaseInstance = eventBase.at(getState().event.eventData.address);

      await eventBaseInstance.resolve(getState().event.resolveResult.index, {
        from: getState().user.address,
        gasPrice: gasPrice,
        gas: gasLimit
      });

      dispatch({type: MODAL_RESOLVE_APPROVED_EVENT});
    } catch (e) {

      let msg;
      const translate = getTranslate(getState().locale);

      if (
        // firefox do not have normal msg, so trying to check for method name in call stack
        e.message.indexOf('nsetTxStatusRejected') !== -1 ||
        // chrome have normal message
        e.message.indexOf('User denied transaction signature') !== -1)
      {
        msg = translate('errors.denied_transaction');
      } else {
        msg = translate('errors.unexpected_error');
      }

      dispatch({type: MODAL_RESOLVE_APPROVE_ERROR_EVENT, error: msg});
    }
  }
};

export const modalWithdrawShow = (withdraw) => ({
  type: MODAL_WITHDRAW_SHOW_EVENT,
  withdraw: withdraw
});

export const modalWithdrawClose = (result) => ({
  type: MODAL_WITHDRAW_CLOSE_EVENT
});

export const modalWithdrawApprove = (gasLimit, gasPrice) => {
  return async (dispatch, getState) => {
    dispatch({type: MODAL_WITHDRAW_APPROVING_EVENT});

    try {
      const contract = require('truffle-contract');
      const eventBase = contract(EventBaseContract);
      eventBase.setProvider(getState().web3.web3.currentProvider);
      const eventBaseInstance = eventBase.at(getState().event.withdraw.address);

      switch (getState().event.withdraw.type) {
        case 'userBet':
          await eventBaseInstance.withdrawPrize(getState().event.withdraw.userBet, {
            from: getState().user.address,
            gasPrice: gasPrice,
            gas: gasLimit
          });

          break;
        case 'eventCreatorReward':
          await eventBaseInstance.withdrawReward({
            from: getState().user.address,
            gasPrice: gasPrice,
            gas: gasLimit
          });

          break;
        default:
          throw new Error('Invalid withdrawal type');
      }

      dispatch({type: MODAL_WITHDRAW_APPROVED_EVENT});
    } catch (e) {

      let msg;
      const translate = getTranslate(getState().locale);

      if (
        // firefox do not have normal msg, so trying to check for method name in call stack
      e.message.indexOf('nsetTxStatusRejected') !== -1 ||
      // chrome have normal message
      e.message.indexOf('User denied transaction signature') !== -1)
      {
        msg = translate('errors.denied_transaction');
      } else {
        msg = translate('errors.unexpected_error');
      }

      dispatch({type: MODAL_WITHDRAW_APPROVE_ERROR_EVENT, error: msg});
    }
  }
};