import { web3Process } from './getWeb3'

const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

const LOCAL_STORAGE_KEY_TOKENS = 'tokens';
const terms = Buffer("VGhpcyBpcyBhIHN0cmluZyB3aGljaCBpcyB1c2VkIGluIE1ldGFNYXNrIHRvIG1ha2UgYSBjcnlwdG9ncmFwaGljIHNpZ25hdHVyZSB1c2luZyB5b3VyIHByaXZhdGUga2V5IHRvIGF1dGhvcml6ZSB5b3UgaW4gUHJvb2Ygb2YgVG9zcy4=", "base64").toString();

const msg = ethUtil.bufferToHex(new Buffer(terms, 'utf8'));

function login(currentAddress, errorCallback, successCallback) {
  web3Process(function (web3) {
    web3.currentProvider.sendAsync(
      {
        'method': 'personal_sign',
        'params': [msg, currentAddress],
        'from': currentAddress
      },
      function (err, result) {
        if (err) {
          return errorCallback(err);
        }

        if (result.error) {
          return errorCallback(result.error);
        }

        const msgParams = {data: msg, sig: result.result};
        const recovered = sigUtil.recoverPersonalSignature(msgParams);

        if (recovered === currentAddress) {
          saveTokenToLocalStorage(currentAddress, result.result);

          return successCallback();
        } else {
          return errorCallback();
        }
      }
    );
  });
}

function logout(currentAddress, successCallback) {
  deleteTokenFromLocalStorage(currentAddress);
  successCallback();
}

function isAuthenticated(address) {
  const token = getTokensFromLocalStorage(address);

  if (token.length > 0) {
    const msgParams = {data: msg, sig: token};
    const recovered = sigUtil.recoverPersonalSignature(msgParams);

    return recovered === address;
  }

  return false;
}

function saveTokenToLocalStorage(address, token) {
  let tokens = getTokensFromLocalStorage();

  tokens[address] = token;
  localStorage.setItem(LOCAL_STORAGE_KEY_TOKENS, JSON.stringify(tokens));
}

function getTokensFromLocalStorage(address) {
  let tokens = localStorage.getItem(LOCAL_STORAGE_KEY_TOKENS);

  if (tokens) {
    tokens = JSON.parse(tokens);

    if (address) {
      return address in tokens ? tokens[address] : {};
    }

    return tokens;
  }

  return {};
}

function deleteTokenFromLocalStorage(address) {
  if (getTokensFromLocalStorage(address)) {
    let tokens = getTokensFromLocalStorage();

    delete tokens[address];

    localStorage.setItem(LOCAL_STORAGE_KEY_TOKENS, JSON.stringify(tokens));
  }
}

export { login, logout, isAuthenticated };