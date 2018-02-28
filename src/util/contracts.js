import contract from 'truffle-contract';
import MainContract from '../../build/contracts/Main.json'
import TokenContract from '../../build/contracts/Token.json'

function contractsHash () {
  return {
    main: MainContract,
    token: TokenContract
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

    return instances;
  });
}

export { deployed }