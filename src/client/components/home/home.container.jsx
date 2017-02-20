import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { setLoggedIn, login } from '../user/user.dux';
import { showHeroLink, hideHeroLink } from '../navbar/navbar.dux';

class Home extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    setLoggedIn: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    showHeroLink: PropTypes.func.isRequired,
    hideHeroLink: PropTypes.func.isRequired
  }

  componentWillMount = () => {
    this.props.hideHeroLink();
  }

  componentWillUnmount = () => {
    this.props.showHeroLink();
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      this.props.history.push('/teams');
    }
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
          {!isLoggedIn &&
          <button
            type="button"
            className="btn-inverse btn-inverse-google"
            onClick={this.props.login}
          >
            Login with Google
          </button>}
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
    login,
    showHeroLink,
    hideHeroLink
  }
)(Home);
