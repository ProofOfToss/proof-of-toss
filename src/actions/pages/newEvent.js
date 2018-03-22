import MainContract from '../../../build/contracts/Main.json'
import TokenContract from '../../../build/contracts/Token.json'
import { getGasCalculation } from '../../util/gasPriceOracle';
import { denormalizeBalance } from './../../util/token';
import { deployed } from '../../util/contracts';
import { serializeEvent } from '../../util/eventUtil';

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
        return tokenInstance.approve(mainInstance.address, deposit, {
          from: getState().user.address,
          gasPrice: gasCalculation.gasPrice,
          gas: gasCalculation.gasLimit
        });
      }).then(() => {
        dispatch({type: FORM_APPROVE_EVENT_SUCCESS});
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
    let mainContract, tokenContract;

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

      }).then(function(instance) {
        tokenContract = instance;
        const deposit = denormalizeBalance(formData.deposit);

        const bytes = serializeEvent({
          name: formData.name,
          description: formData.description,
          deposit: deposit,
          bidType: formData.bidType,
          category: formData.category,
          locale: formData.language,
          startDate: formData.startTime.unix(),
          endDate: formData.endTime.unix(),
          sourceUrl: formData.sourceUrls.join(','),
          tags: formData.tags,
          results: formData.results.map((result) => { return {'coefficient': result.coefficient, 'description': result.name}; }),
        });

        return tokenContract.transferERC223(mainContract.address, deposit, bytes, {
            from: getState().user.address,
            gasPrice: gasPrice,
            gas: gasLimit
        });

      }).then(async function (transactionResult) {

        const events = await new Promise((resolve, reject) => {
          mainContract.NewEvent({}, {fromBlock: transactionResult.receipt.blockNumber, toBlock: 'pending', topics: transactionResult.receipt.logs[0].topics}).get((error, log) => {
            if (error) {
              reject(error);
            }

            if (log[0].transactionHash === transactionResult.tx) {
              resolve(log);
            }
          });
        });

        return events[0].args.eventAddress;

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
