import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import GoogleLogin from 'react-google-login';
import { setLoggedIn } from '../user/user.dux';
import { showNav, hideNav } from './navbar.dux';
import { getTeams } from '../team/team.dux';

class Navbar extends Component {
  static propTypes = {
    shouldShowHeroLink: PropTypes.bool.isRequired,
    shouldShowNav: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    setLoggedIn: PropTypes.func.isRequired,
    showNav: PropTypes.func.isRequired,
    hideNav: PropTypes.func.isRequired,
    givenName: PropTypes.string,
    teams: PropTypes.array,
    getTeams: PropTypes.func.isRequired
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.isLoggedIn !== this.props.isLoggedIn) {
      if (nextProps.isLoggedIn) {
        console.log('getting teams from nav');
        this.props.getTeams()
      }
    }
  }

  render() {
    const { shouldShowNav, shouldShowHeroLink, isLoggedIn, givenName, teams } = this.props;
    const teamsForNav = teams.map(team => ({ title: team.name || 'Untitled team', to: `/teams/${team.id}`, isSecondary: true }));
    return (
      <header className="header">
        <nav className="header-nav">
          <div className="container">
            {(() => {
              if (!isLoggedIn) {
                return;
              }
              if (shouldShowNav) {
                return <button className="btn-no-style header-nav-mobile-ui"
                  onClick={this.props.hideNav}>
                  <i className="material-icons">close</i>
                </button>;
              }
              return <button className="btn-no-style header-nav-mobile-ui"
                onClick={this.props.showNav}>
                <i className="material-icons">menu</i>
              </button>;
            })()}
            {shouldShowHeroLink &&
            <Link
              to="/"
              onClick={this.props.hideNav}
              className="header-home-anchor">
              Good Chat
            </Link>}
            {!this.props.isLoggedIn && <GoogleLogin
              clientId={googleClientId}
              scope="profile"
              className="btn-no-style header-user-ui"
              buttonText="Login"
              onSuccess={this.props.setLoggedIn}
              onFailure={this.props.setLoggedIn}
              autoLoad={true}
            />}
            {this.props.isLoggedIn && <Link to="/user" className="header-user-ui">{givenName}</Link>}
          </div>
        </nav>
        {shouldShowNav && <a className="header-app-nav-scrim" onClick={this.props.hideNav} />}
        <nav className={`header-app-nav${ shouldShowNav ? ' header-app-nav-show': '' }`}>
          {isLoggedIn &&
          <ul className="header-app-nav-list">
            {[
              { title: 'My Teams', to: '/teams' },
              ...teamsForNav,
              { title: 'MyProfile', to: '/user'}
            ].map((link, index) => <li key={index} className={link.isSecondary ? 'header-app-nav-list-item-secondary' : ''}>
              <Link to={link.to} onClick={this.props.hideNav}>{link.title} <i className="material-icons pull-right header-app-nav-list-icon">chevron_right</i></Link>
            </li>)}
          </ul>}
          <ul className="footer-btn-list">
            <li>
              <button className="btn-primary-inverse btn-block"
                type="button"
                onClick={this.props.hideNav}>
                Close
              </button>
            </li>
          </ul>
        </nav>
      </header>
    );
  }
}

export default connect(
  state => ({
    isLoggedIn: state.user.isLoggedIn,
    givenName: state.user.givenName,
    shouldShowHeroLink: state.navbar.shouldShowHeroLink,
    shouldShowNav: state.navbar.shouldShowNav,
    teams: state.team.teams
  }),
  {
    setLoggedIn,
    showNav,
    hideNav,
    getTeams
  }
)(Navbar);
