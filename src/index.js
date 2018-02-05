import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import Web3Local from 'web3';
import { refreshBalance } from './actions/token'
import initLocale  from './components/locale/init'

// Layouts
import App from './App'
import Home from './pages/home/Home'

import SignIn from './pages/user/SignIn'

import Wallet from './pages/wallet/Index'

import Play from './pages/play/Index'
import PlayEvent from './pages/play/Event'
import PlayBidConfirmation from './pages/play/BidConfirmation'
import PlayContestResult from './pages/play/ContestResult'

import Payments from './pages/payments/Index'
import PaymentsWithdraw from './pages/payments/Withdraw'

import Judge from './pages/judge/Index'

import Storage from './pages/storage/Storage'
import NotFound from './pages/not_found/NotFound';
import Events from './pages/events/Events';
import NewEvent from './pages/new_event/NewEvent';
import Event from './pages/event/Event';

// Redux Store
import store from './store';
import { initWeb3, lockWallet, unlockWallet, changeAddress, web3LostConnection } from './actions/web3';

// Put ReactDOM.render() to a function because we need to wrap the rendering with web3 detection
function renderReactDOM(web3) {

  const provider = new Web3Local.providers.HttpProvider(web3.currentProvider.originRpcAddress);

  if (typeof web3 !== 'undefined') {
    store.dispatch(initWeb3(web3, new Web3Local(provider)));
  }

  initLocale();

  const history = syncHistoryWithStore(browserHistory, store);

  const checkAuthorization = function () {
    if (store.getState().user.isAuthenticated === false) {
      history.push("/sign-in");
    }
  };

  ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />

          <Route path="sign-in" component={SignIn} />

          <Route path="wallet" component={Wallet} onEnter={ checkAuthorization } />
          <Route path="wallet/:page" component={Wallet} onEnter={ checkAuthorization } />


          <Route path="play" component={Play} onEnter={ checkAuthorization } />
          <Route path="play/event" component={PlayEvent} onEnter={ checkAuthorization } />
          <Route path="play/event/bid_confirmation" component={PlayBidConfirmation} onEnter={ checkAuthorization } />
          <Route path="play/event/contest_result" component={PlayContestResult} onEnter={ checkAuthorization } />

          <Route path="payments" component={Payments} onEnter={ checkAuthorization } />
          <Route path="payments/withdraw" component={PaymentsWithdraw} onEnter={ checkAuthorization } />

          <Route path="judge" component={Judge} onEnter={ checkAuthorization } />

          <Route path="storage" component={Storage} onEnter={ checkAuthorization } />
          <Route path='events' component={Events} onEnter={ checkAuthorization } />
          <Route path='new_event' component={NewEvent} onEnter={ checkAuthorization } />
          <Route path='event(/:id)' component={Event} onEnter={ checkAuthorization } />

          <Route path='*' component={NotFound} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)
}

// Inject Web3 into store and render React DOM
import getWeb3 from './util/getWeb3';
import { isAuthenticated } from './util/auth';
import { authenticateUser, logoutUser } from './actions/user'

function checkAuthentication(address, redirectToSignIn) {
  if (isAuthenticated(address)) {
    store.dispatch(authenticateUser(address));
  } else {
    store.dispatch(logoutUser());

    if (redirectToSignIn === true) {
      browserHistory.push('/sign-in');
    }
  }
}

getWeb3
  .then(function (results) {
    var hasAccounts = null;
    var currentAddress = null;
    var hasConnection = null;

    // There are some problems with getting accounts through the public property,
    // but still try to get accounts and double check the same thing within setInterval() function below.
    if (results.web3.eth.accounts.length > 0) {
      checkAuthentication(results.web3.eth.accounts[0], false);
    }

    setInterval(function () {
      if (results.web3.version.network === 'loading' && hasConnection !== false) {
        hasConnection = false;

        store.dispatch(web3LostConnection());
      }

      results.web3.eth.getAccounts(function (err, accounts) {
        if (accounts.length === 0) {
          if (hasAccounts !== false) {
            // Wallet is locked
            store.dispatch(lockWallet());
            store.dispatch(logoutUser());

            browserHistory.push('/sign-in', hasAccounts !== null);
            hasAccounts = false;
          }
        } else {
          if (hasAccounts !== true) {
            // Wallet is unlocked
            store.dispatch(unlockWallet(accounts[0]));

            checkAuthentication(accounts[0], hasAccounts !== null);

            currentAddress = accounts[0];
            hasAccounts = true;
          } else if (accounts[0] !== currentAddress) {
            // The address in the wallet has been changed
            store.dispatch(changeAddress(accounts[0]));

            checkAuthentication(accounts[0], currentAddress !== null);

            currentAddress = accounts[0];
          }
        }
      });
    }, 500);

    renderReactDOM(results.web3);
  })
  .then(() => {
    store.dispatch(refreshBalance());

    setInterval(() => {
      store.dispatch(refreshBalance());
    }, 500);
  })
  .catch(function(e) {
    renderReactDOM();
  });
