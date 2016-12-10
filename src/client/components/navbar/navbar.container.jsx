import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import {setLoggedIn, logout} from '../user/user.dux';
import {showNav, hideNav} from './navbar.dux';

class Navbar extends Component {
  static propTypes = {
    shouldShowHeroLink: PropTypes.bool.isRequired,
    shouldShowNav: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    picture: PropTypes.object,
    setLoggedIn: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    showNav: PropTypes.func.isRequired,
    hideNav: PropTypes.func.isRequired,
    name: PropTypes.string
  }

  getLoggedInUI = () => {
    const {picture, name} = this.props;
    // if ('data' in picture && 'url' in picture.data) {
    //   return <img
    //     className="header-user-ui-img"
    //     src={picture.data.url}
    //   />;
    // }
    return <a className="header-user-ui">{name.split(' ')[0]}</a>;
  }

  onLogoutClick = () => {
    this.props.logout();
    this.props.hideNav();
  }

  render() {
    const { shouldShowNav, shouldShowHeroLink, isLoggedIn } = this.props;
    return (
      <header>
        <nav className="header">
          {(() => {
            if (shouldShowNav) {
              return <button className="btn-no-style"
                onClick={this.props.hideNav}>
                <i className="fa fa-times" />
              </button>;
            }
            return <button className="btn-no-style"
              onClick={this.props.showNav}>
              <i className="fa fa-bars" />
            </button>;
          })()}
          {shouldShowHeroLink && <a className="header-home-anchor"/>}
          {!isLoggedIn && <FacebookLogin
            appId={window.fbAppId}
            autoLoad={true}
            fields="name,email,picture"
            cssClass="btn-no-style header-user-ui"
            textButton="Login"
            callback={this.props.setLoggedIn}
          />}
          {this.props.isLoggedIn && this.getLoggedInUI()}
        </nav>
        <nav className={`header-app-nav${ shouldShowNav ? ' header-app-nav-show': '' }`}>
          <ul className="header-app-nav-list">
            <li>
              <a>Beauty talent <i className="fa fa-chevron-right pull-right"/></a>
            </li>
            <li>
              <a>Calendar <i className="fa fa-chevron-right pull-right"/></a>
            </li>
            <li>
              <a>Foo bar <i className="fa fa-chevron-right pull-right"/></a>
            </li>
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
    picture: state.user.picture,
    name: state.user.name,
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
