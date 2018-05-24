import { SAVE_TX, REMOVE_TX, SET_INTERVAL } from '../actions/tx';

const initialState = {
  'txStatuses': load(),
  'watchInterval': null,
};

const LOCAL_STORAGE_KEY_TX_STATUS = 'LOCAL_STORAGE_KEY_TX_STATUS';

function load() {
  const json = localStorage.getItem(LOCAL_STORAGE_KEY_TX_STATUS);

  return json ? JSON.parse(json) : {};
}

const txReducer = (state = initialState, action) => {
  let txStatuses;

  switch (action.type) {
    case SAVE_TX:
      txStatuses = Object.assign({}, state.txStatuses);
      txStatuses[action.tx.key] = action.tx;

      localStorage.setItem(LOCAL_STORAGE_KEY_TX_STATUS, JSON.stringify(txStatuses));

      return Object.assign({}, state, { txStatuses });

    case REMOVE_TX:
      txStatuses = Object.assign({}, state.txStatuses);
      delete txStatuses[action.key];

      localStorage.setItem(LOCAL_STORAGE_KEY_TX_STATUS, JSON.stringify(txStatuses));

      return Object.assign({}, state, { txStatuses });

    case SET_INTERVAL:
      return Object.assign({}, state, { watchInterval: action.watchInterval });

    default:
      return state;
  }
};

export default txReducer;
