import buildDirConfig from './../../build_dir.json';

/**
 * Gets built contract JSON object.
 *
 * @param {string} contract Contract name without .json extension and without base_build_dir/contracts path
 * @returns {*}
 */
export function getBuiltContract(contract) {
  return require('../../' + buildDirConfig.base_build_dir + '/contracts/' + contract + '.json');
}
