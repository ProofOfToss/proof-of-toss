import { FETCHED_EVENT, RESET_EVENT, MODAL_ADD_NEW_BET_CLOSE_EVENT, MODAL_NEW_BET_SHOW_EVENT,
  ADD_NEW_BET_ADDING_EVENT, ADD_NEW_BET_ADDED_EVENT, ADD_NEW_BET_ERROR_EVENT,

  MODAL_RESOLVE_SHOW_EVENT, MODAL_RESOLVE_CLOSE_EVENT, MODAL_RESOLVE_APPROVING_EVENT,
  MODAL_RESOLVE_APPROVED_EVENT, MODAL_RESOLVE_APPROVE_ERROR_EVENT,

  MODAL_WITHDRAW_SHOW_EVENT, MODAL_WITHDRAW_CLOSE_EVENT, MODAL_WITHDRAW_APPROVING_EVENT,
  MODAL_WITHDRAW_APPROVED_EVENT, MODAL_WITHDRAW_APPROVE_ERROR_EVENT,

  DID_NOT_HAPPEN_EVENT
} from '../../actions/pages/event';

const initialState = {
  fetched: false,
  eventData: {},
  newBetData: {},

  resolveModalId: null,
  newBetModalId: null,
  withdrawModalId: null,

  showNewBetModal: false,
  showWithdrawModal: false,
  newBetSaving: false,
  newBetSaved: false,
  newBetError: false,

  showResolveModal: false,
  resolveApproving: false,
  resolveApproved: false,
  resolveApproveError: false,
  resolveResult: {}
};

const eventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FETCHED_EVENT:
      return {
        ...state,
        fetched: true,
        eventData: action.eventData
      };

    case RESET_EVENT:
      return {
        ...state,
        ...initialState
      };

    case MODAL_NEW_BET_SHOW_EVENT:
      return {
        ...state,
        showNewBetModal: true,
        newBetData: {
          result: action.result,
          resultIndex: action.resultIndex,
          amount: action.amount
        },
        newBetModalId: null
      };

    case MODAL_ADD_NEW_BET_CLOSE_EVENT:
      return {
        ...state,
        showNewBetModal: false,
        newBetSaving: false,
        newBetSaved: false,
        newBetError: false,
        newBetData: {},
        newBetModalId: null
      };

    case ADD_NEW_BET_ADDING_EVENT:
      return {
        ...state,
        newBetError: false,
        newBetSaving: true,
        newBetModalId: action.modalId,
      };

    case ADD_NEW_BET_ADDED_EVENT:
      return action.modalId === state.newBetModalId ? {
        ...state,
        newBetData: {},
        newBetSaving: false,
        newBetSaved: true
      } : state;

    case ADD_NEW_BET_ERROR_EVENT:
      return action.modalId === state.newBetModalId ? {
        ...state,
        newBetSaving: false,
        newBetError: action.error
      } : state;

    //Resolve modal
    case MODAL_RESOLVE_SHOW_EVENT:
      return {
        ...state,
        showResolveModal: true,
        resolveResult: action.result,
        resolveModalId: null,
      };

    case MODAL_RESOLVE_CLOSE_EVENT:
      return {
        ...state,
        showResolveModal: false,
        resolveApproving: false,
        resolveApproved: false,
        resolveApproveError: false,
        resolveResult: {},
        resolveModalId: null,
      };

    case MODAL_RESOLVE_APPROVING_EVENT:
      return {
        ...state,
        resolveApproving: true,
        resolveApproveError: false,
        resolveModalId: action.modalId
      };

    case MODAL_RESOLVE_APPROVED_EVENT:
      return action.modalId === state.resolveModalId ? {
        ...state,
        resolveApproving: false,
        resolveApproved: true,
        resolveResult: {}
      } : state;

    case MODAL_RESOLVE_APPROVE_ERROR_EVENT:
      return action.modalId === state.resolveModalId ? {
        ...state,
        resolveApproving: false,
        resolveApproveError: action.error
      } : state;

    //Withdraw modal
    case MODAL_WITHDRAW_SHOW_EVENT:
      return {
        ...state,
        showWithdrawModal: true,
        withdraw: action.withdraw,
        withdrawModalId: null
      };

    case MODAL_WITHDRAW_CLOSE_EVENT:
      return {
        ...state,
        showWithdrawModal: false,
        withdrawApproving: false,
        withdrawApproved: false,
        withdrawApproveError: false,
        withdraw: {},
        eventData: {},
        withdrawModalId: null
      };

    case MODAL_WITHDRAW_APPROVING_EVENT:
      return {
        ...state,
        withdrawApproving: true,
        withdrawApproveError: false,
        withdrawModalId: action.modalId
      };

    case MODAL_WITHDRAW_APPROVED_EVENT:
      return action.modalId === state.withdrawModalId ? {
        ...state,
        withdrawApproved: true,
        withdraw: {}
      } : state;

    case MODAL_WITHDRAW_APPROVE_ERROR_EVENT:
      return action.modalId === state.withdrawModalId ? {
        ...state,
        withdrawApproving: false,
        withdrawApproveError: action.error
      } : state;

    //Did not happen
    case DID_NOT_HAPPEN_EVENT:
      return {
        ...state
      };

    default:
      return state;
  }
};

export default eventReducer;
