import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { getTranslate } from 'react-localize-redux';
import { login } from './../../util/auth';
import { authenticateUser } from '../../actions/user';
import '../../styles/pages/login.scss';

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginFailed: false,
      errorMessage: ''
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleSuccessfulLogin = this.handleSuccessfulLogin.bind(this);
    this.handleFailureLogin = this.handleFailureLogin.bind(this);
  }

  redirectToHomepageIfAuthenticated() {
    if (this.props.isAuthenticated === true) {
      this.props.router.push("/");
    }
  }

  componentWillMount() {
    this.redirectToHomepageIfAuthenticated();
  }

  componentDidMount() {
    this.redirectToHomepageIfAuthenticated();
  }

  componentDidUpdate() {
    this.redirectToHomepageIfAuthenticated();
  }

  handleLogin() {
    if (this.props.web3HasConnection === false) {
      this.setState({loginFailed: true, errorMessage: this.props.translate('pages.login.not_connted_to_rpc')});
    } else {
      this.setState({loginFailed: false, errorMessage: ''});
    }

    login(this.props.currentAddress, this.handleFailureLogin, this.handleSuccessfulLogin)
  }

  handleSuccessfulLogin() {
    this.setState({loginFailed: false, errorMessage: ''});
    this.props.dispatch(authenticateUser(this.props.currentAddress));
    this.props.router.push("/");
  }

  handleFailureLogin(e) {
    this.setState({loginFailed: true, errorMessage: e.message});
  }

  renderErrorMessage() {
    if (this.state.loginFailed === true) {
      return (
        <div className="alert alert-danger" role="alert">
          { this.props.translate('pages.login.error') }
        </div>
      );
    }

    return '';
  }

  renderFAQ() {
      return <div className="panel panel-default">
            <div className="panel-body">
              <h3>FAQ</h3>
              <ul className="list-group">
                <li className="list-group-item">
                  <b>What do I need to get started with PROOF OF TOSS?</b><br />
                  You will need only 4 things:
            <ul>
              <li>A computer or laptop with the desktop version of Chrome or Firefox</li>
              <li>MetaMask - a digital wallet to work with specifically web apps</li>
              <li>TOSS tokens - tokens that are used within PROOF OF TOSS ecosystem</li>
              <li>SBTC  - cryptocurrency to pay for Gas ( the transaction fee) in RSK test network.</li>
            </ul>
                </li>
                <li className="list-group-item">
                  <b>Installing your digital wallet - MetaMask</b><br />
                  To start with PROOF OF TOSS, you will need to install a digital wallet <a href="https://metamask.io">MetaMask</a>.<br />
            Then you need to set up connection with RSK in your MetaMask wallet. In the left upper corner in the MetaMask window press name of  the network (Main, Ropsten etc.).<br />
            In the dropdown list choose Custom RPC option. Then enter <a href="https://public-node.testnet.rsk.co/">https://public-node.testnet.rsk.co/</a> URL in the field New RPC and press Save. That’s it!<br />
            In your MetaMask wallet you will see amount in ETH, although it will be SBTC.<br />
            <b>Note</b>: Don't’ forget that digital wallets like MetaMask act like a bank account. Thus, make sure you remember your password or the seed words to recover your wallet.<br />
            Follow the short video instruction <a href="https://www.youtube.com/watch?v=6Gf_kRE4MJU">https://www.youtube.com/watch?v=6Gf_kRE4MJU</a>.<br />
                </li>
                <li className="list-group-item">
                  <b>Why is MetaMask locked?</b><br />
                  PROOF OF TOSS displays a lock screen and offers you to unlock your wallet. This happens because MetaMask automatically locks your account after a certain period of time. To unlock simply click on the MetaMask extension and fill in your password.<br />
            <img src="/images/faq-locked.png" alt="Why is MetaMask locked?" />
          </li>
          <li className="list-group-item">
            <b>Reinstalling MetaMask</b><br />
            Sometimes you will need to uninstall and reinstall MetaMask because it may have experienced a bug.<br />
            Please, find your seed words before reinstalling MetaMask!<br />
            Delete the extension, reinstall it, and type your twelve seed words. Then set the password you want to use (it can be the same old password or any new one).<br />
            That’s it! You reinstalled your MetaMask!
                </li>
                <li className="list-group-item">
                  <b>How can I get test TOSS tokens?</b><br />
                  You can’t buy the test TOSS tokens for dollars or any other fiat currency before the token sale. To get TOSS you need to login and go to <a href="/faucet">Faucet</a> page to get test TOSS tokens that will work in RSK test network.<br />
            The Faucet page is a special page within the system to get test TOSS tokens.<br />
            TOSS tokens allow you to participate in the testing environment of betting ecosystem PROOF OF TOSS before tokensale.
                </li>
                <li className="list-group-item">
                  <b>How can I get SBTC?</b><br />
                  SBTC is a cryptocurrency that allows you to pay for Gas (the transaction fee) in RSK.<br />
            To participate in Proof of Toss you need to get SBTC -  you need to <a href="/sign-in">login</a> and go to <a href="/faucet">Faucet page</a> to request SBTC.<br />
            The Faucet page is a special page within the system to get test TOSS tokens and SBTC.<br />
                </li>
              </ul>
            </div></div>
  }

  renderSignInContent() {
    if (this.props.web3 === null) {
      return (
        <div>
          <div className="alert alert-danger" role="alert">
            <p>{ this.props.translate('pages.login.please_install_metamask') }</p>
            <p><a href="#" onClick={ () => { /*window.location.reload()*/ } }>{ this.props.translate('pages.login.i_have_enabled_metamask') }</a></p>
          </div>

          {this.renderFAQ()}
        </div>
      );
    }

    if (this.props.isWalletLocked === true) {
      return (
        <div>
          <div className="alert alert-danger" role="alert">{ this.props.translate('pages.login.metamask_locked') }</div>

          {this.renderFAQ()}
        </div>
      );
    }

    return (
      <div>
        <p className="text-center">
          <a className="btn btn-primary btn-lg" onClick={ () => { this.handleLogin() } }>
            Sign in
          </a>
        </p>

        { this.renderErrorMessage() }

        {this.renderFAQ()}

      </div>
    );
  }

  render() {
    return(
      <main className="container login">
        <div>
          <h1>{this.props.translate('pages.login.header')}</h1>
          <p>{this.props.translate('pages.login.welcome')}</p>
          <div>
            { this.renderSignInContent() }
          </div>
        </div>
      </main>
    )
  }
}

function mapPropsToState(state) {
  return {
    isAuthenticated: state.user.isAuthenticated,
    isWalletLocked: state.web3.isWalletLocked,
    currentAddress: state.web3.currentAddress,
    web3: state.web3.web3,
    web3HasConnection: state.web3.hasConnection,
    translate: getTranslate(state.locale),
  };
}

export default withRouter(connect(mapPropsToState)(SignIn));
