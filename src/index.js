import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'

// Layouts
import App from './App'
import Home from './pages/home/Home'

import Register from './pages/user/Register'
import Login from './pages/user/Login'

import Wallet from './pages/wallet/Index'
import WalletDeposit from './pages/wallet/Deposit'
import WalletSend from './pages/wallet/Send'

import Play from './pages/play/Index'
import PlayEvent from './pages/play/Event'
import PlayBidConfirmation from './pages/play/BidConfirmation'
import PlayContestResult from './pages/play/ContestResult'

import Payments from './pages/payments/Index'
import PaymentsWithdraw from './pages/payments/Withdraw'

import Judge from './pages/judge/Index'
import JudgeConfirmResult from './pages/judge/ModalConfirmResult'

import Storage from './pages/storage/Storage'
import NotFound from './pages/not_found/NotFound';
import Events from './pages/events/Events';
import NewEvent from './pages/new_event/NewEvent';
import Event from './pages/event/Event';

// Redux Store
import store from './store';

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />

          <Route path="register" component={Register} />
          <Route path="login" component={Login} />

          <Route path="wallet" component={Wallet} />
          <Route path="wallet/deposit" component={WalletDeposit} />
          <Route path="wallet/send" component={WalletSend} />

          <Route path="play" component={Play} />
          <Route path="play/event" component={PlayEvent} />
          <Route path="play/event/bid_confirmation" component={PlayBidConfirmation} />
          <Route path="play/event/contest_result" component={PlayContestResult} />

          <Route path="payments" component={Payments} />
          <Route path="payments/withdraw" component={PaymentsWithdraw} />

          <Route path="judge" component={Judge} />
          <Route path="judge/confirm_result" component={JudgeConfirmResult} />

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
