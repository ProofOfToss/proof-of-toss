import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { getTranslate } from 'react-localize-redux';
import { login } from './../../util/auth';
import { authenticateUser } from '../../actions/user';

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

  renderSignInContent() {
    if (this.props.web3 === null) {
      return (
        <div>
          <div className="alert alert-danger" role="alert">
            <p>{ this.props.translate('pages.login.please_install_metamask') }</p>
            <p><a href="#" onClick={ () => { /*window.location.reload()*/ } }>{ this.props.translate('pages.login.i_have_enabled_metamask') }</a></p>
          </div>

          <div className="panel panel-default">
            <div className="panel-body">
              <h3>FAQ</h3>
              <ul className="list-group">
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Dapibus ac facilisis inDapibus ac facilisis in?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (this.props.isWalletLocked === true) {
      return (
        <div>
          <div className="alert alert-danger" role="alert">{ this.props.translate('pages.login.metamask_locked') }</div>

          <div className="panel panel-default">
            <div className="panel-body">
              <h3>FAQ</h3>
              <ul className="list-group">
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Dapibus ac facilisis inDapibus ac facilisis in?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
                <li className="list-group-item">
                  <b>Cras justo odio Cras justo odio?</b><br />
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                </li>
              </ul>
            </div>
          </div>
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

        <div className="panel panel-default">
          <div className="panel-body">
            <h3>FAQ</h3>
            <ul className="list-group">
              <li className="list-group-item">
                <b>Cras justo odio Cras justo odio?</b><br />
                The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
              </li>
              <li className="list-group-item">
                <b>Dapibus ac facilisis inDapibus ac facilisis in?</b><br />
                The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
              </li>
              <li className="list-group-item">
                <b>Cras justo odio Cras justo odio?</b><br />
                The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
              </li>
              <li className="list-group-item">
                <b>Cras justo odio Cras justo odio?</b><br />
                The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
              </li>
              <li className="list-group-item">
                <b>Cras justo odio Cras justo odio?</b><br />
                The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return(
      <main className="container">
        <div>
          <h1>Sign in</h1>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
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
