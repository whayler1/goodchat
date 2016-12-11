import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import GoogleLogin from 'react-google-login';
import {setLoggedIn, logout} from '../user/user.dux';
import {showNav, hideNav} from './navbar.dux';

class Navbar extends Component {
  static propTypes = {
    shouldShowHeroLink: PropTypes.bool.isRequired,
    shouldShowNav: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    setLoggedIn: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    showNav: PropTypes.func.isRequired,
    hideNav: PropTypes.func.isRequired,
    givenName: PropTypes.string
  }

  onLogoutClick = () => {
    this.props.logout();
    this.props.hideNav();
  }

  responseGoogle = res => this.props.setLoggedIn(res.profileObj)

  render() {
    const { shouldShowNav, shouldShowHeroLink, isLoggedIn, givenName } = this.props;
    return (
      <header>
        <nav className="header">
          {(() => {
            if (shouldShowNav) {
              return <button className="btn-no-style"
                onClick={this.props.hideNav}>
                <i className="material-icons">close</i>
              </button>;
            }
            return <button className="btn-no-style"
              onClick={this.props.showNav}>
              <i className="material-icons">menu</i>
            </button>;
          })()}
          {shouldShowHeroLink && <a className="header-home-anchor"/>}
          {!this.props.isLoggedIn && <GoogleLogin
            clientId={googleClientId}
            scope="profile"
            className="btn-no-style header-user-ui"
            buttonText="Login"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
            autoLoad={true}
          />}
          {this.props.isLoggedIn && <a className="header-user-ui">{givenName}</a>}
        </nav>
        <nav className={`header-app-nav${ shouldShowNav ? ' header-app-nav-show': '' }`}>
          <ul className="header-app-nav-list">
            {[
              { title: 'Link One' },
              { title: 'Second Link' },
              {title: 'Another link'}
            ].map((link, index) => <li key={index}>
              <a>{link.title} <i className="material-icons pull-right">chevron_right</i></a>
            </li>)}
          </ul>
          <div className="header-app-nav-footer">
            {isLoggedIn && <button className="btn-secondary"
              type="button"
              onClick={this.onLogoutClick}>
              Logout
            </button>}
            <button className="btn-primary-inverse"
              type="button"
              onClick={this.props.hideNav}>
              Close
            </button>
          </div>
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
    shouldShowNav: state.navbar.shouldShowNav
  }),
  {
    setLoggedIn,
    logout,
    showNav,
    hideNav
  }
)(Navbar);
