import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { login } from './../../util/auth';
import { authenticateUser } from '../../actions/user';

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginFailed: false,
      errorMessage: ''
    };

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
      return (<div><br/><b>{ this.state.errorMessage }</b></div>);
    }

    return '';
  }

  renderSignInButton() {
    return (
      <a className="btn btn-primary btn-large"onClick={ () => {
          login(this.props.currentAddress, this.handleFailureLogin, this.handleSuccessfulLogin)
        } }>
        Sign in
      </a>
    );
  }

  render() {
    return(
      <main className="container">
        <div>
          <h1>Sign in</h1>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
          <div>
            {
              this.props.isWalletLocked
                ? <b>Please unlock your wallet to proceed!</b>
                : this.renderSignInButton()
            }
          </div>

          { this.renderErrorMessage() }
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
    web3: state.web3.web3
  };
}

export default withRouter(connect(mapPropsToState)(SignIn));
