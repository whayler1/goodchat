import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import GoogleLogin from 'react-google-login';
import Helmet from "react-helmet";
import {setLoggedIn} from '../user/user.dux';
import {showHeroLink, hideHeroLink} from '../navbar/navbar.dux';

class Home extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    setLoggedIn: PropTypes.func,
    showHeroLink: PropTypes.func.isRequired,
    hideHeroLink: PropTypes.func.isRequired
  }
  componentWillMount() {
    this.props.hideHeroLink();
  }
  componentWillUnmount() {
    this.props.showHeroLink();
  }
  render() {
    const googleClientId = window.googleClientId;
    const { isLoggedIn } = this.props;
    return (
      <main className="main main-home" role="main">
        <Helmet
          title="Good Chat"
          meta={[{"name": "description", "content": "This thing me and Chris are building."}]}
        />
        <h1 className="main-home-title">Good Chat</h1>
        <div className="main-home-bottom">
          <p className="main-home-copy">This thing I am <span className="nowrap">building with Chris</span></p>
          {!isLoggedIn && <GoogleLogin
            clientId={googleClientId}
            scope="profile"
            className="btn-primary-inverse"
            onSuccess={this.props.setLoggedIn}
            onFailure={this.props.setLoggedIn}
          >Login with google</GoogleLogin>}
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    isLoggedIn: state.user.isLoggedIn
  }),
  {
    setLoggedIn,
    showHeroLink,
    hideHeroLink
  }
)(Home);
