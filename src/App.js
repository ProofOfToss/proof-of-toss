import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import initLocale  from './components/locale/init'
import Header  from './components/navbar_user/Header';
import Footer  from './components/footer/Footer';
import ModalWeb3LostConnection from './components/modal/ModalWeb3LostConnection'
import ModalInvalidNetwork from './components/modal/ModalInvalidNetwork'
import '../src/img/logo.png';
import '../src/img/sprite.png';

global.jQuery = require("jquery");
require("bootstrap-sass");

// Styles
import './styles/App.scss'

class App extends Component {
  constructor(props) {
    super(props);

    initLocale(props.dispatch, props.params.locale);
  }

  _menuLinkClass(path) {
    if (!this.props.location) {
      return '';
    }

    return this.props.location.pathname === path ? 'active' : '';
  }

  render() {
    return (
      <Fragment>
        <div className="App">

          <Header />

          { this.props.web3HasConnection && !this.props.validNetworkSelected ? <ModalInvalidNetwork /> : this.props.children }

          <Footer />

          { this.props.web3HasConnection === false ? <ModalWeb3LostConnection /> : '' }
        </div>
      </Fragment>
    );
  }
}

function mapPropsToState(state) {
  return {
    isAuthenticated: state.user.isAuthenticated,
    web3HasConnection: state.web3.hasConnection,
    validNetworkSelected: state.web3.validNetworkSelected,
    isWhitelisted: state.user.isWhitelisted,
  };
}

export default connect(mapPropsToState)(App);
