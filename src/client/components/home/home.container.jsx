import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { setLoggedIn } from '../user/user.dux';
import { showHeroLink, hideHeroLink } from '../navbar/navbar.dux';

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
    const { isLoggedIn } = this.props;
    return (
      <main className="main-home" role="main">
        <Helmet
          title="Good Chat"
          meta={[{"name": "description", "content": "This thing me and Chris are building."}]}
        />
        <h1 className="main-home-title">Good Chat</h1>
        <div className="main-home-bottom">
          <p className="main-home-copy">A tool for managers to<br/><strong>make the most<br/>out of 1on1&rsquo;s</strong></p>
          <div className="g-signin2" data-onsuccess="onSignIn"></div>
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
