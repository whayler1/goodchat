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
    gapi.load('client:auth2', () => {
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      gapi.client.init({
        client_id: this.props.googleClientId,
        cookiepolicy: 'single_host_origin',
        scope: 'https://www.googleapis.com/auth/calendar'
      }).then(() => gapi.client.load('calendar','v3', () => {
          const auth2 = gapi.auth2.getAuthInstance();
          if (auth2.isSignedIn.get()) {
            this.props.onSuccess(auth2.currentUser.get().getAuthResponse().id_token).then(
              () => this.setState({ isLoginStateSet: true }),
              () => this.setState({ isLoginStateSet: true })
            );
          } else {
            this.setState({ isLoginStateSet: true });
          }
        })
      );
    });
  }

  render() {
    return (
      <div>
        {this.state.isLoginStateSet && this.props.children}
      </div>
    );
  }
}
