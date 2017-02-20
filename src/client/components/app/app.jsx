import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Navbar from '../navbar/navbar.container.jsx';

import SetLogin from '../SetLogin/SetLogin.jsx';

import { setLoggedIn } from '../user/user.dux.js';

class App extends Component {
  static propTypes = {
    setLoggedIn: PropTypes.func.isRequired
  }

  render() {
    return (
      <SetLogin googleClientId={window.googleClientId} onSuccess={this.props.setLoggedIn}>
        <Navbar/>
        {this.props.children}
      </SetLogin>
    )
  }
}

export default connect(
  null,
  {
    setLoggedIn
  }
)(App);
