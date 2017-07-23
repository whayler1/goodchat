import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { setLoggedIn, login } from '../user/user.dux';
import { clearRedirect } from '../login/login.dux';
import { showHeroLink, hideHeroLink } from '../navbar/navbar.dux';
import { getTeams } from '../team/team.dux';
import GoogleLoginBtn from '../GoogleLoginBtn/GoogleLoginBtn.component.jsx';

class Home extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    setLoggedIn: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    showHeroLink: PropTypes.func.isRequired,
    hideHeroLink: PropTypes.func.isRequired,
    getTeams: PropTypes.func.isRequired,
    clearRedirect: PropTypes.func.isRequired,
    redirect: PropTypes.string
  }

  goToTeams = id => this.props.history.push(`/teams${id ? '/' + id : ''}`);

  redirect = () => {
    /**
     * JW: Forward user to the "right" place once they've logged in. If a redirect is defined
     * go there. Otherwise check to see if a most recent team is in local storage. If not then
     * forward them to their teams landing page.
     */
    const { goToTeams } = this;
    const { redirect } = this.props;
    if (redirect) {
      this.props.history.push(redirect);
      this.props.clearRedirect();
    } else if ('localStorage' in window) {
      const lastTeam = window.localStorage.getItem('goodchat.last-team');
      if (lastTeam) {
        this.props.getTeams(
          teams => {
            const isTeamInTeams = teams.findIndex(team => team.id === lastTeam) > -1

            if (isTeamInTeams) {
              goToTeams(lastTeam);
            } else {
              goToTeams();
            }
          },
          () => goToTeams()
        )
      } else {
        goToTeams()
      }
    } else {
      goToTeams()
    }
  }

  componentWillMount = () => {
    if (this.props.isLoggedIn) {
      this.redirect();
    }
    this.props.hideHeroLink();
  }

  componentWillUnmount = () => {
    this.props.showHeroLink();
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      this.redirect();
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
        <div className="main-home-content">
          <h1 className="main-home-title vanity-font">GoodChat</h1>
            <p className="main-home-copy"><strong>Get the most out of 1on1's</strong></p>
            {!isLoggedIn &&
            <GoogleLoginBtn
              onClick={this.props.login}
              className="nowrap"
            />}
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    isLoggedIn: state.user.isLoggedIn,
    redirect: state.login.redirect
  }),
  {
    setLoggedIn,
    login,
    showHeroLink,
    hideHeroLink,
    getTeams,
    clearRedirect
  }
)(Home);
