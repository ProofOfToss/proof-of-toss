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
            <b>{this.props.translate('pages.login.faq.faq_1_question')}</b><br />
            {this.props.translate('pages.login.faq.faq_1_answer')}
          </li>
          <li className="list-group-item">
            <b>{this.props.translate('pages.login.faq.faq_2_question')}</b><br />
            {this.props.translate('pages.login.faq.faq_2_answer')}
          </li>
          <li className="list-group-item">
            <b>{this.props.translate('pages.login.faq.faq_3_question')}</b><br />
            {this.props.translate('pages.login.faq.faq_3_answer')}
          </li>
          <li className="list-group-item">
            <b>{this.props.translate('pages.login.faq.faq_4_question')}</b><br />
            {this.props.translate('pages.login.faq.faq_4_answer')}
          </li>
          <li className="list-group-item">
            <b>{this.props.translate('pages.login.faq.faq_5_question')}</b><br />
            {this.props.translate('pages.login.faq.faq_5_answer')}
          </li>
          <li className="list-group-item">
            <b>{this.props.translate('pages.login.faq.faq_6_question')}</b><br />
            {this.props.translate('pages.login.faq.faq_6_answer')}
          </li>
        </ul>
      </div>
    </div>
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
    translate: getTranslate(state.locale)
  };
}

export default withRouter(connect(mapPropsToState)(SignIn));
