import fs from 'fs';
import path from 'path';
import appConfig from './../data/config.json';

/**
 * Gets built contract JSON object.
 *
 * @param {string} contract Contract name without .json extension and without base_build_dir/contracts path
 * @returns {*}
 */
export function getBuiltContract(contract) {
  return require('../../' + appConfig.base_build_dir + '/contracts/' + contract + '.json');
}
