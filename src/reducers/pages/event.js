import { FETCHED_EVENT, MODAL_ADD_NEW_BET_CLOSE_EVENT,
  MODAL_NEW_BET_SHOW_EVENT, ADD_NEW_BET_ADDING_EVENT, ADD_NEW_BET_ADDED_EVENT,
  MODAL_RESOLVE_SHOW_EVENT, MODAL_RESOLVE_CLOSE_EVENT, MODAL_RESOLVE_APPROVED_EVENT}
from '../../actions/pages/event';

const initialState = {
  fetched: false,
  eventData: {},
  newBetData: {},
  showNewBetModal: false,
  showResolveModal: false,
  newBetSaving: false,
  newBetSaved: false
};

const eventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FETCHED_EVENT:
      return {
        ...state,
        fetched: true,
        eventData: action.eventData
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
        newBetSaved: false,
        showNewBetModal: false,
        newBetData: {}
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

    //Resolve modal
    case MODAL_RESOLVE_SHOW_EVENT:
      return {
        ...state,
        showResolveModal: true,
        resolveResult: action.result
      };

    case MODAL_RESOLVE_CLOSE_EVENT:
      return {
        ...state,
        showResolveModal: false,
        resolveResult: {}
      };

    case MODAL_RESOLVE_APPROVED_EVENT:
      return {
        ...state,
        resolveResult: {},
        resolveApproved: true
      };

    default:
      return state;
  }
};

export default eventReducer;
