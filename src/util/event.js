import EventContract from '../../build/contracts/Event.json'
// import config from '../data/config.json'

const contract = require('truffle-contract');
const event = contract(EventContract);

function fetchEvent(web3, address) {
  event.setProvider(web3.currentProvider);
  return event.at(address);
}

export {
  fetchEvent
};
