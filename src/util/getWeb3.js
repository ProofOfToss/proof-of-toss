import Web3 from 'web3'

var getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    var results;
    var web3 = window.web3;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider);

      results = {
        web3: web3
      };

      console.log('Injected web3 detected.');
    } else {
      results = {web3: null};
    }

    resolve(results);
  })
});

function web3Process(callback) {
  getWeb3
  .then(results => {
    callback(results.web3);
  })
  .catch((e) => {
    console.log('Error finding web3.', e);
  });
}

export default getWeb3;
export { getWeb3, web3Process };
