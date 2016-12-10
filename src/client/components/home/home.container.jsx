import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from "react-helmet";
import FacebookLogin from 'react-facebook-login';
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
    return (
      <main className="main main-home" role="main">
        <Helmet
          title="Le Baume"
          meta={[{"name": "description", "content": "Top tier beauty talent at your home or event. Browse NYC makeup artists and hair stylists previously only available to the fashion industry. Book online now."}]}
        />
        <h1 className="main-home-title">Le Baume</h1>
        <div className="main-home-bottom">
          <p className="main-home-copy">Top tier beauty talent<br/>at your home or event.</p>
          {!this.props.isLoggedIn && <FacebookLogin
            appId={window.fbAppId}
            autoLoad={true}
            fields="name,email,picture"
            cssClass="btn-inverse"
            icon={<i className="fa fa-facebook" />}
            textButton="Login with facebook"
            callback={this.props.setLoggedIn} />}
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
