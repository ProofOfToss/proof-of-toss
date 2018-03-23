import { FETCHED_EVENT, FETCHING_ALLOWANCE, FETCHED_ALLOWANCE, MODAL_ADD_NEW_BET_CLOSE_EVENT, APPROVED_SUCCESS_EVENT,
  MODAL_NEW_BET_SHOW_EVENT, ADD_NEW_BET_ADDING_EVENT, ADD_NEW_BET_ADDED_EVENT }
from '../../actions/pages/event';

const initialState = {
  eventInstance: null,
  allowance: 0,
  newBetData: {},
  showNewBetModal: false,
  newBetSaving: false,
  newBetSaved: false
};

const eventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FETCHED_EVENT:
      return {
        ...state,
        eventInstance: action.eventInstance,
        eventData: action.eventData
      };

    case FETCHING_ALLOWANCE:
      return {
        ...state
      };

    case FETCHED_ALLOWANCE:
      return {
        ...state,
        allowance: action.allowance
      };

    case APPROVED_SUCCESS_EVENT:
      return {
        ...state,
        allowance: action.allowance
      };

    case MODAL_NEW_BET_SHOW_EVENT:
      return {
        ...state,
        showNewBetModal: true,
        newBetData: {
          result: action.result,
          resultIndex: action.resultIndex,
          amount: action.amount
        }
      };

    case MODAL_ADD_NEW_BET_CLOSE_EVENT:
      return {
        ...state,
        showNewBetModal: false
      };

    case ADD_NEW_BET_ADDING_EVENT:
      return {
        ...state,
        newBetSaving: true
      };

    case ADD_NEW_BET_ADDED_EVENT:
      return {
        ...state,
        newBetData: {},
        newBetSaved: true
      };

    default:
      return state;
  }
};

export default eventReducer;
