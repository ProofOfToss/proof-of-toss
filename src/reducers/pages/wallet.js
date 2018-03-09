import { FETCH_TRANSACTIONS_PENDING, FETCH_TRANSACTIONS_FULFILLED,
  TRANSACTION_SAVED
} from '../../actions/pages/wallet';

const initialState = {
  pending: false,
  transactions: []
};

const walletReducer = (state = initialState, action) => {

  switch (action.type) {
    case FETCH_TRANSACTIONS_PENDING:
      return {
        ...state,
        pending: true
      };

    case FETCH_TRANSACTIONS_FULFILLED:
      return {
        ...state,
        pending: false,
        transactions: action.payload
      };

    case TRANSACTION_SAVED:
      let transactions = state.transactions.slice();
      transactions.splice(0, 0, action.payload);

      return {
        ...state,
        transactions: transactions
      };

    default:
      return state;
  }
};

export default walletReducer;
