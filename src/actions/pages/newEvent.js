import MainContract from '../../../build/contracts/Main.json'
import TokenContract from '../../../build/contracts/Token.json'

export const SAVE_EVENT = 'SAVE_EVENT';
export const SAVED_EVENT = 'SAVED_EVENT';

export const saveEvent = (formData) => {
  return (dispatch, getState) => {
    dispatch({type: SAVE_EVENT, formData: formData});

    const web3 = getState().web3.web3;
    let mainContract;
    let tokenContract;

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

      }).then((instance) => {

        tokenContract = instance;

        return tokenContract.approve(mainContract.address, formData.deposit, {from: getState().user.address});

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

        return mainContract.newEvent(formData.name, formData.deposit, formData.description, 1,
          `${formData.category}.${formData.language}.${formData.startTime.unix()}.${formData.endTime.unix()}`,
          formData.sourceUrls[0], tags, results,
          {from: getState().user.address});

      }).then(function () {

        return mainContract.getLastEvent({from: getState().user.address});

      }).then((eventAddress) => {

        dispatch({type: SAVED_EVENT});

      });
    })
  }
};

export const savedEvent = () => ({
  'type': SAVED_EVENT
});
