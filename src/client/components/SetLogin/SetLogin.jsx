import React, { Component, PropTypes } from 'react';

export default class SetLogin extends Component {
  static propTypes = {
    googleClientId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired
  }
  state = {
    isLoginStateSet: false
  }

  componentWillMount = () => {
    gapi.load('auth2', () => {
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      gapi.auth2.init({
        client_id: this.props.googleClientId,
        cookiepolicy: 'single_host_origin'
      }).then(() => {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
          this.props.onSuccess(auth2.currentUser.get().getAuthResponse().id_token);
        }
      });
    });
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
