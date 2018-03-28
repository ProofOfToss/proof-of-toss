import EventBaseContract from '../../../build/contracts/EventBase.json';
import { deployed } from "../../util/contracts";
import { formatBalance, denormalizeBalance } from './../../util/token';
import { toBytesTruffle as toBytes } from '../../util/serialityUtil';
import appConfig from "../../data/config.json"

export const FETCHED_EVENT = 'FETCHED_EVENT';
export const FETCHING_ERROR_EVENT = 'FETCHING_ERROR_EVENT';

export const MODAL_NEW_BET_SHOW_EVENT = 'MODAL_NEW_BET_SHOW_EVENT';
export const MODAL_ADD_NEW_BET_CLOSE_EVENT = 'MODAL_ADD_NEW_BET_CLOSE_EVENT';
export const ADD_NEW_BET_ADDING_EVENT = 'ADD_NEW_BET_ADDING_EVENT';
export const ADD_NEW_BET_ADDED_EVENT = 'ADD_NEW_BET_ADDED_EVENT';

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
      eventData.status = (await eventBaseInstance.state()).toNumber();

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
            coefficient: results[i][0].toNumber(),
            betCount: results[i][1].toNumber(),
            betSum: formatBalance(results[i][2].toNumber())
          });

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
      await tokenInstance.transferERC223(
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
      console.log(e);
    }
  }
};
