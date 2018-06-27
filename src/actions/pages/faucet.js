import { refreshBalance } from '../token'

export const SUBMIT_QUERY = 'SUBMIT_QUERY';
export const ERROR_RESPONSE = 'ERROR_RESPONSE';
export const SUCCESS_RESPONSE = 'SUCCESS_RESPONSE';
export const FETCHING_TRANSACTION_STATUS = 'FETCHING_TRANSACTION_STATUS';
export const TRANSACTION_STATUS_SUCCESS = 'TRANSACTION_STATUS_SUCCESS';

const fetchTransactionStatus = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: FETCHING_TRANSACTION_STATUS
    });

    const transactionInterval = setInterval(function() {
      if(!getState().faucet.txHash || !getState().faucet.txHash.toss) {
        clearInterval(transactionInterval);
        return;
      }

      getState().web3.web3.eth.getTransaction(getState().faucet.txHash.toss, (error, data) => {
        if(data.blockNumber !== null) {
          clearInterval(transactionInterval);
          dispatch({
            type: TRANSACTION_STATUS_SUCCESS
          });

          dispatch(refreshBalance(getState().user.address));
        }
      });
    }, 5000);
  }
};

export const submitQuery = (url) => {
  return async (dispatch, getState) => {
    dispatch({type: SUBMIT_QUERY});

    const response = await fetch(url);
    const data = await response.json();

    if(data.errorMessage) {
      dispatch({
        type: ERROR_RESPONSE,
        payload: data,
      });

      return;
    }

    dispatch({
      type: SUCCESS_RESPONSE,
      payload: data
    });

    dispatch(fetchTransactionStatus());
  }
};