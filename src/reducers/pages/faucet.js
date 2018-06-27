import { SUBMIT_QUERY, SUCCESS_RESPONSE, ERROR_RESPONSE, FETCHING_TRANSACTION_STATUS, TRANSACTION_STATUS_SUCCESS
} from '../../actions/pages/faucet';

const initialState = {
  submitQuery: false,
  submitQueryError: false,
  fetchingTransactionStatus: false,
  txHash: {},
  successTransaction: false,
  error: null
};

const faucetReducer = (state = initialState, action) => {

  switch (action.type) {
    case SUBMIT_QUERY:
      return {
        ...state,
        ...initialState,
        submitQuery: true

      };

    case SUCCESS_RESPONSE:
      return {
        ...state,
        submitQuery: false,
        txHash: action.payload
      };

    case ERROR_RESPONSE:
      return {
        ...state,
        ...initialState,
        submitQueryError: true,
        error: action.payload
      };

    case FETCHING_TRANSACTION_STATUS:
      return {
        ...state,
        fetchingTransactionStatus: true,
        submitQuery: false
      };

    case TRANSACTION_STATUS_SUCCESS:
      return {
        ...state,
        fetchingTransactionStatus: false,
        successTransaction: true,
        submitQueryError: false
      };

    default:
      return state;
  }
};

export default faucetReducer;
