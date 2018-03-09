import { getMyTransactions, calculateGasPrice } from './../../util/token';

export const FETCH_TRANSACTIONS_PENDING = 'TRANSACTIONS_PENDING';
export const FETCH_TRANSACTIONS_FULFILLED = 'TRANSACTIONS_FULFILLED';
export const FETCH_TRANSACTIONS_REJECTED  = 'TRANSACTIONS_REJECTED ';
export const TRANSACTION_SAVED  = 'TRANSACTION_SAVED ';

export const fetchTransactions = () => {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_TRANSACTIONS_PENDING
    });

    getMyTransactions(getState().web3.web3).then(transactions => {

      transactions.sort(function(transaction1, transaction2) {
        if(transaction1.time < transaction2.time) {
          return 1;
        } else if (transaction1.time > transaction2.time) {
          return -1;
        } else {
          return 0;
        }
      });

      dispatch({
        type: FETCH_TRANSACTIONS_FULFILLED,
        payload: transactions
      });
    })
  }
};

export const transactionSaved = (transaction, sum) => {
  let fee;

  return (dispatch, getState) => {
    calculateGasPrice(getState().web3.web3, transaction.hash)
      .then(_fee => {
        fee = _fee;

        return new Promise((_resolve, _reject) => {
          getState().web3.web3.eth.getBlock(transaction.blockNumber, (err, block) => {
            if (err) {
              _reject(err);
              return;
            }

            _resolve(block.timestamp)
          });
        })
      })
      .then(timestamp => {
        transaction = {
          time: new Date(timestamp * 1000),
          to: transaction.to,
          from: transaction.from,
          sum: sum,
          fee: fee
        };

        dispatch({
          type: TRANSACTION_SAVED,
          payload: transaction
        })
      })
      // .catch(e => reject(e))
    ;
  }

  // return {
  //   type: TRANSACTION_SAVED,
  //   payload: transaction
  // }
}
