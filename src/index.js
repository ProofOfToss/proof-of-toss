import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'

// Layouts
import App from './App'
import Home from './pages/home/Home'
import Storage from './pages/storage/Storage'
import NotFound from './pages/not_found/NotFound';
import Events from './pages/events/Events';
import NewEvent from './pages/new_event/NewEvent';
import Event from './pages/event/Event';

// Redux Store
import store from './store'

const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
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
