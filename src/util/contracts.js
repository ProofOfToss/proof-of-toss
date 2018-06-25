import contract from 'truffle-contract';
import {getBuiltContract} from './buildDir';

const MainContract = getBuiltContract('Main');
const TokenContract = getBuiltContract('Token');
const WhitelistContract = getBuiltContract('Whitelist');
const EventContract = getBuiltContract('Event');

function contractsHash () {
  return {
    main: MainContract,
    token: TokenContract,
    whitelist: WhitelistContract,
    event: EventContract,
  }
}

function deployed(web3, ...contracts) {
  let contractPromises = [];

  contracts.forEach((contractName) => {
    const contractAbstraction = contract(contractsHash()[contractName]);
    contractAbstraction.setProvider(web3.currentProvider);

    contractPromises.push(contractAbstraction.deployed())
  });

  let instances = {};

  return Promise.all(contractPromises).then((arrayInstances) => {
    arrayInstances.forEach((arrayInstances, key) => {
      instances[contracts[key] + 'Instance'] = arrayInstances;
    });

    window.instances = instances;

    return instances;
  });
}

export { deployed }