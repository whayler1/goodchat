import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { Link } from 'react-router';
import { login, logout } from '../user/user.dux';

class TeamError extends Component {
  static propTypes = {
    email: PropTypes.string.inRequired,
    login: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired
  }

  logout = () => this.props.logout().then(
    () => this.props.history.push('/'),
    err => console.log('error loggin out', err)
  );

  render() {
    console.log(this.props);
    const { email } = this.props;
    return (
      <main className="main main-team-set-name" role="main">
        <Helmet title="Team Error"/>
        <div className="container container-slim">
          <h1 className="vanity-font">Whoops 😬</h1>
          <p><b>You are not logged in as a member of <span className="nowrap">this team.</span></b></p>
          <p>You are currently logged in as <b>{email}</b>. You may need to <a onClick={this.logout}>logout</a> and log back in as a user with access to <span className="nowrap">this team.</span></p>
          <ul className="stacked-to-inline-list gutter-large-top">
            <li>
              <button
                type="button"
                className="btn-primary-inverse"
                onClick={this.logout}
              >Log out <i className="material-icons">exit_to_app</i></button>
            </li>
            <li>
              <Link to="/teams">Go to my teams <i className="material-icons">chevron_right</i></Link>
            </li>
          </ul>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    email: state.user.email
  }),
  {
    login,
    logout
  }
)(TeamError);
