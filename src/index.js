import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'

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
import { initWeb3, lockWallet, unlockWallet, changeAddress } from './actions/web3';

const history = syncHistoryWithStore(browserHistory, store);

// Put ReactDOM.render() to a function because we need to wrap the rendering with web3 detection
function renderReactDOM(web3) {
  if (typeof web3 !== 'undefined') {
    store.dispatch(initWeb3(web3));
  }

  ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />

          <Route path="sign-in" component={SignIn} />

          <Route path="wallet" component={Wallet} />

          <Route path="play" component={Play} />
          <Route path="play/event" component={PlayEvent} />
          <Route path="play/event/bid_confirmation" component={PlayBidConfirmation} />
          <Route path="play/event/contest_result" component={PlayContestResult} />

          <Route path="payments" component={Payments} />
          <Route path="payments/withdraw" component={PaymentsWithdraw} />

          <Route path="judge" component={Judge} />

          <Route path="storage" component={Storage} />
          <Route path='events' component={Events} />
          <Route path='new_event' component={NewEvent} />
          <Route path='event(/:id)' component={Event} />

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

getWeb3
  .then(function (results) {
    var hasAccounts = null;
    var currentAddress = null;

    function checkAuthentication(address) {
      if (isAuthenticated(address)) {
        store.dispatch(authenticateUser(address));
      } else {
        store.dispatch(logoutUser());
        history.push('/sign-in');
      }
    }

    if (results.web3.eth.accounts.length > 0) {
      checkAuthentication(results.web3.eth.accounts[0]);
    }

    setInterval(function () {
      results.web3.eth.getAccounts(function (err, accounts) {
        if (accounts.length === 0) {
          if (hasAccounts !== false) {
            // Wallet is locked
            hasAccounts = false;

            store.dispatch(lockWallet());
            store.dispatch(logoutUser());
            history.push('/sign-in');
          }
        } else {
          if (hasAccounts !== true) {
            // Wallet is unlocked
            hasAccounts = true;
            currentAddress = accounts[0];

            store.dispatch(unlockWallet(accounts[0]));
            checkAuthentication(accounts[0]);
          } else if (accounts[0] !== currentAddress) {
            // The address in the wallet has been changed
            currentAddress = accounts[0];

            store.dispatch(changeAddress(accounts[0]));
            checkAuthentication(accounts[0]);
          }
        }
      });
    }, 500);

    renderReactDOM(results.web3);
  })
  .catch(function() {
    renderReactDOM();
  });

