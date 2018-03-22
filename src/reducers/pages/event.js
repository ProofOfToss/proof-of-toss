import { FETCHED_EVENT, ADD_NEW_BET_EVENT } from '../../actions/pages/event';

const initialState = {
  eventInstance: null,
  showNewBetModal: false,
  newBetData: {}
};

const eventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FETCHED_EVENT:
      return {
        ...state,
        eventInstance: action.eventInstance
      };

    case ADD_NEW_BET_EVENT:
      return {
        ...state,
        showNewBetModal: true,
        newBetData: {
          result: action.result
        }
      };

    default:
      return state;
  }
};

export default eventReducer;
