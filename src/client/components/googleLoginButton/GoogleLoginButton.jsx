import React, { Component, PropTypes } from 'react';

export default class GoogleLoginButton extends Component {
  static propTypes = {
    googleClientId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired
  }

  onGapiLoad = (res) => {
    console.log('onGapiLoad!', res);

    gapi.load('auth2', (res) => {
      console.log('auth2 res', res);
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      gapi.auth2.init({
        client_id: this.props.googleClientId,
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      }).then(() => {
        const auth2 = gapi.auth2.getAuthInstance();
        console.log('authInstance', auth2.currentUser.get().getAuthResponse().id_token);
        console.log(auth2.isSignedIn.get());
      });
      // attachSignin(document.getElementById('customBtn'));
      // this.attachSignin()
    });
  }

  attachSignin = () => {
    console.log('attachSignin', this.buttonEl, '\n\nauth2', this.auth2.isSignedIn.get());
    this.auth2.attachClickHandler(this.buttonEl, {},
      function(googleUser) {
        // document.getElementById('name').innerText = "Signed in: " +
        //     googleUser.getBasicProfile().getName();
        console.log('googleUser', googleUser);
      }, function(error) {
        console.log(JSON.stringify(error, undefined, 2));
      });
  }

  componentDidMount = () => {
    const scriptTagId = 'gapi';

    if (!document.getElementById(scriptTagId)) {
      const scriptTag = document.createElement('script');
      Object.assign(scriptTag, {
        id: scriptTagId,
        src: '//apis.google.com/js/api:client.js',
        onload: this.onGapiLoad
      });
      document.body.appendChild(scriptTag)
    }
  }

  render() {
    return (
      <button ref={el => this.buttonEl = el}>foo</button>
    );
  }
}
