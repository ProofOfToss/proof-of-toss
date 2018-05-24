import appConfig from "../data/config.json";
import callAsync from '../util/web3Util';

export const SAVE_TX = 'SAVE_TX';
export const REMOVE_TX = 'REMOVE_TX';
export const SET_INTERVAL = 'SET_INTERVAL';

export const LOCAL_STORAGE_KEY_TX_STATUS = 'LOCAL_STORAGE_KEY_TX_STATUS';

export const TX_STATUS_DEFAULT = 'DEFAULT';
export const TX_STATUS_PENDING = 'PENDING';
export const TX_STATUS_REJECTED = 'REJECTED';
export const TX_STATUS_SUCCESSFUL = 'SUCCESSFUL';
export const TX_STATUS_INDEXED = 'INDEXED';

const EVENT_INDEX = 'toss_event_' + appConfig.elasticsearch.indexPostfix;
const BET_INDEX = 'toss_bet_' + appConfig.elasticsearch.indexPostfix;

export function newTx(key, txHash, type, data) {
  const tx = {
    key,
    txHash,
    type,
    data,
    status: TX_STATUS_PENDING,
  };

  return (dispatch, getState) => {
    dispatch({
      type: SAVE_TX,
      tx
    });
  };
}

function saveTx(tx, dispatch) {
  dispatch({type: SAVE_TX, tx});
}

export function watchTransactions() {
  return (dispatch, getState) => {
    let watchInterval = getState().tx.watchInterval;

    if (watchInterval) { return; }

    watchInterval = setInterval(async () => {
      const esClient = getState().elastic.client;
      const web3 = getState().web3.web3;
      const txStatuses = getState().tx.txStatuses;

      let tx;

      for(let key in txStatuses) {
        if (!txStatuses.hasOwnProperty(key)) { continue; }

        tx = txStatuses[key];

        if (tx.status === TX_STATUS_PENDING) {
          try {
            const transactionReceipt = await callAsync(web3.eth.getTransactionReceipt.bind(web3.eth, tx.txHash));

            if (transactionReceipt.blockHash) {

              if (transactionReceipt.success) {
                saveTx(Object.assign(tx, {status: TX_STATUS_SUCCESSFUL}), dispatch);
              } else {
                saveTx(Object.assign(tx, {status: TX_STATUS_REJECTED}), dispatch);
              }
            }

          } catch (err) {
            saveTx(Object.assign(tx, {status: TX_STATUS_REJECTED}), dispatch);
          }

        } else if (tx.status === TX_STATUS_SUCCESSFUL) {

          if (tx.type === 'withdrawPrize') {

            const bet = await esClient.get({
              index: BET_INDEX,
              type: 'bet',
              id: tx.data.betTxHash
            });

            if(bet.found) {
              saveTx(Object.assign(tx, {status: TX_STATUS_INDEXED}), dispatch);
            }

          } else if (tx.type === 'withdrawReward') {

            const event = await esClient.get({
              index: EVENT_INDEX,
              type: 'event',
              id: tx.data.eventAddress
            });

            if(event.found) {
              saveTx(Object.assign(tx, {status: TX_STATUS_INDEXED}), dispatch);
            }

          } else {
            saveTx(Object.assign(tx, {status: TX_STATUS_INDEXED}), dispatch);
          }

        } else { // remove REJECTED and INDEXED

          dispatch({type: REMOVE_TX, key});

        }
      }
    }, 5000);

    dispatch({
      type: SET_INTERVAL,
      watchInterval
    });
  };
}
