import MainContract from '../../../build/contracts/Main.json'
import TokenContract from '../../../build/contracts/Token.json'
import { getGasCalculation } from '../../util/gasPriceOracle';
import { denormalizeBalance } from './../../util/token';
import { deployed } from '../../util/contracts';

export const FORM_APPROVE_EVENT = 'FORM_APPROVE_EVENT';
export const FORM_APPROVE_EVENT_SUCCESS = 'FORM_APPROVE_EVENT_SUCCESS';
export const FORM_APPROVE_EVENT_ERROR = 'FORM_APPROVE_EVENT_ERROR';
export const FORM_SAVE_EVENT = 'FORM_SAVE_EVENT';
export const MODAL_SAVE_EVENT = 'MODAL_SAVE_EVENT';
export const MODAL_CLOSE_EVENT = 'MODAL_CLOSE_EVENT';
export const SAVE_ERROR_EVENT = 'SAVE_ERROR_EVENT';
export const SAVED_EVENT = 'SAVED_EVENT';

export const approveEvent = (deposit) => {
  return (dispatch, getState) => {
    dispatch({type: FORM_APPROVE_EVENT, deposit: deposit});

    const web3 = getState().web3.web3;

    deployed(web3, 'main', 'token').then(({mainInstance, tokenInstance}) => {
      tokenInstance.approve.estimateGas(mainInstance.address, deposit, {
        from: getState().user.address
      })
        .then((gasAmount) => {
          return getGasCalculation(web3, gasAmount);
        })
        .then((gasCalculation) => {
          console.log(gasCalculation);
          return tokenInstance.approve(mainInstance.address, deposit, {
            from: getState().user.address,
            gasPrice: gasCalculation.gasPrice,
            gas: gasCalculation.gasLimit
          });
        }).then(() => {
        dispatch({type: FORM_APPROVE_EVENT_SUCCESS})
      });
    });
  }
};

export const formSaveEvent = (formData) => ({
  type: FORM_SAVE_EVENT,
  formData: formData
});

export const modalSaveEvent = (gasLimit, gasPrice) => {

  return (dispatch, getState) => {
    dispatch({type: MODAL_SAVE_EVENT});

    const formData = getState().newEvent.formData;
    const web3 = getState().web3.web3;
    let mainContract;

    const contract = require('truffle-contract');
    const main = contract(MainContract);
    const token = contract(TokenContract);
    main.setProvider(web3.currentProvider);
    token.setProvider(web3.currentProvider);

    web3.eth.getAccounts((error, accounts) => {
      self.accounts = accounts;

      main.deployed().then((instance) => {

        mainContract = instance;
        return token.deployed();

      }).then(function() {

        const tags = formData.tags.reduce((previousValue, currentValue) => {
          if(previousValue.length > 0) {
            previousValue += '.';
          }

          return `${previousValue}${formData.language}.${currentValue}`
        }, '');

        const results = formData.results.reduce((previousValue, currentValue) => {
          if(previousValue.length > 0) {
            previousValue += '.';
          }

          return `${previousValue}${currentValue.name}.${currentValue.coefficient}`
        }, '');

        return mainContract.newEvent(formData.name, denormalizeBalance(formData.deposit), formData.description, 1,
          `${formData.category}.${formData.language}.${formData.startTime.unix()}.${formData.endTime.unix()}`,
          formData.sourceUrls[0], tags, results, {
            from: getState().user.address,
            gasPrice: gasPrice,
            gas: gasLimit
        });

      }).then(function () {

        return mainContract.getLastEvent({from: getState().user.address});

      }).then((eventAddress) => {

        dispatch({type: SAVED_EVENT});

      }).catch(function(e) {
        dispatch({type: SAVE_ERROR_EVENT, error: e})
      });
    })
  }
};

export const modalCloseEvent = () => ({
  type: MODAL_CLOSE_EVENT
});

export const savedEvent = () => ({
  'type': SAVED_EVENT
});
