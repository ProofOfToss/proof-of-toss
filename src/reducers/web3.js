import { INIT_WEB3 } from '../actions/web3';

const web3Reducer = (state = { 'web3': null }, action) => {
  switch (action.type) {
    case INIT_WEB3:
      return { 'web3': action.web3 };

    default:
      return state;
  }
};

export default web3Reducer;
