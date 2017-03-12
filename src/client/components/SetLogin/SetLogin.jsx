import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import superagentIntercept from 'superagent-intercept';
import Modal from '../modal/modal.container.jsx';
import { clearLoginError } from './SetLogin.dux.js';

class SetLogin extends Component {
  static propTypes = {
    googleClientId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    loginError: PropTypes.object.isRequired,
    clearLoginError: PropTypes.func.isRequired
  }
  state = {
    isLoginStateSet: false
  }

  componentWillMount = () => {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: this.props.googleClientId,
        cookiepolicy: 'single_host_origin'
      }).then(() => {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
          this.props.onSuccess(auth2.currentUser.get().getAuthResponse().id_token);
        }
        this.setState({ isLoginStateSet: true });
      });
    });
  }

  render() {
    console.log('this.props.loginError', this.props.loginError);
    return (
      <div>
        {this.state.isLoginStateSet && this.props.children}
        {this.props.loginError.status &&
        <Modal closeFunc={this.props.clearLoginError}><h1>You must log in</h1></Modal>}
      </div>
    );
  }
}

export default connect(
  state => ({
    loginError: state.login.loginError
  }),
  {
    clearLoginError
  }
)(SetLogin);
