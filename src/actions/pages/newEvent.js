import MainContract from '../../../build/contracts/Main.json'
import TokenContract from '../../../build/contracts/Token.json'
import { getTranslate } from 'react-localize-redux';
import { denormalizeBalance } from './../../util/token';
import { serializeEvent } from '../../util/eventUtil';
import { decodeEvent } from '../../util/web3Util';

export const FORM_SAVE_EVENT = 'FORM_SAVE_EVENT';
export const MODAL_SAVE_EVENT = 'MODAL_SAVE_EVENT';
export const MODAL_CLOSE_EVENT = 'MODAL_CLOSE_EVENT';
export const SAVE_ERROR_EVENT = 'SAVE_ERROR_EVENT';
export const SAVED_EVENT = 'SAVED_EVENT';

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
          results: formData.results.map((result) => { return {'coefficient': result.coefficient || 0, 'description': result.description}; }),
        });

        return tokenContract.transferToContract(mainContract.address, deposit, bytes, {
            from: getState().user.address,
            gasPrice: gasPrice,
            gas: gasLimit
        });

      }).then(async function (transactionResult) {

        const event = decodeEvent(web3, transactionResult.receipt.logs, main, 'NewEvent');

        return event.eventAddress;

      }).then((eventAddress) => {

        dispatch({type: SAVED_EVENT});

      }).catch(function(e) {
        let msg;
        const translate = getTranslate(getState().locale);
        if (
          // firefox do not have normal msg, so trying to check for method name in call stack
          e.message.indexOf('nsetTxStatusRejected') !== -1 ||
          // chrome have normal message
          e.message.indexOf('User denied transaction signature') !== -1)
        {
          msg = translate('errors.denied_transaction');
        } else {
          msg = translate('errors.unexpected_error');
        }

        dispatch({type: SAVE_ERROR_EVENT, error: msg});
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
