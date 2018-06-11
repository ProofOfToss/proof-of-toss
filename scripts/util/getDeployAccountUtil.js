import appConfig from '../../src/data/config.json';

export function getDeployAccount(accounts) {
  if (appConfig.deploy_from !== false) {
    return appConfig.deploy_from;
  }

  if (accounts.length === 0) {
    throw new Error('No accounts found.');
  }

  return accounts[0];
}
