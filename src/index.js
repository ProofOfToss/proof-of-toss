import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import checkRouteLocale  from './components/routing/checkRouteLocale'

// Layouts
import App from './App'

import SignIn from './pages/user/SignIn'

import Wallet from './pages/wallet/Index'

import Play from './pages/play/Index'
import Event from './pages/event/Event';

import MyBets from './pages/user/MyBets';
import Withdraw from './pages/user/withdraw';

import Faucet from './pages/faucet/Index';

//Admin components
import AdminEvent from './pages/admin/event/Index';
import NewEvent from './pages/new_event/NewEvent';
import EventResults from './pages/event_results/EventResults';

import NotFound from './pages/not_found/NotFound';

// Redux Store
import store from './store';
import { initWeb3, lockWallet, unlockWallet, changeAddress, web3LostConnection } from './actions/web3';
import { watchTransactions } from './actions/tx';

// Put ReactDOM.render() to a function because we need to wrap the rendering with web3 detection
function renderReactDOM() {
  const history = syncHistoryWithStore(browserHistory, store);

  const checkAuthorization = function () {
    if (store.getState().user.isAuthenticated === false) {
      history.push("/sign-in");
    }
  };

  const routes = (
    <Fragment>
      <Route path="sign-in" component={SignIn} />

      <IndexRoute component={Play} onEnter={ checkAuthorization } />
      <Route path="wallet" component={Wallet} onEnter={ checkAuthorization } />
      <Route path="wallet/:page" component={Wallet} onEnter={ checkAuthorization } />

      <Route path='event(/:id)' component={Event} onEnter={ checkAuthorization } />

      <Route path='cabinet/my_bets' component={MyBets} onEnter={ checkAuthorization } />
      <Route path='cabinet/withdraw' component={Withdraw} onEnter={ checkAuthorization } />

      <Route path='faucet' component={Faucet} onEnter={ checkAuthorization } />

      <Route path="admin">
        <Route path='new_event' component={NewEvent} onEnter={ checkAuthorization } />
        <Route path='event(/:id)' component={AdminEvent} onEnter={ checkAuthorization } />
        <Route path='event_results' component={EventResults} onEnter={ checkAuthorization } />
      </Route>

      <Route path='*' component={NotFound} />
    </Fragment>

  );

  ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route component={ App } onEnter={checkRouteLocale} >

          <Route path="/:locale/" >
            {routes}
          </Route>

          <Route path="/" onEnter={checkRouteLocale} >
            {routes}
          </Route>
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

    store.dispatch(initWeb3(results.web3));

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

          if (accounts[0] !== store.getState().web3.currentAddress) {
            // The address in the wallet has been changed
            store.dispatch(changeAddress(accounts[0]));
          }
        }
      });
    }, 500);

    store.dispatch(watchTransactions());

    renderReactDOM();
  })
  .catch(function(e) {
    renderReactDOM();
  });
