import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { setLoggedIn, login } from '../user/user.dux';
import { clearRedirect } from '../login/login.dux';
import { showHeroLink, hideHeroLink } from '../navbar/navbar.dux';
import { getTeams } from '../team/team.dux';

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

  componentWillMount = () => {
    this.props.hideHeroLink();
  }

  componentWillUnmount = () => {
    this.props.showHeroLink();
  }

  goToTeams = id => this.props.history.push(`/teams${id ? '/' + id : ''}`);

  componentWillReceiveProps = nextProps => {
    /**
     * JW: Forward user to the "right" place once they've logged in. If a redirect is defined
     * go there. Otherwise check to see if a most recent team is in local storage. If not then
     * forward them to their teams landing page.
     */
    const { goToTeams } = this;
    const { redirect } = this.props;
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      if (redirect) {
        this.props.history.push(redirect);
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
    isLoggedIn: state.user.isLoggedIn,
    redirect: state.login.redirect
  }),
  {
    setLoggedIn,
    login,
    showHeroLink,
    hideHeroLink,
    getTeams
  }
)(Home);
