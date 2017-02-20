import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import superagent from 'superagent';
import Helmet from 'react-helmet';

import { setLoggedIn, login } from '../user/user.dux.js';

class InviteAccept extends Component {
  static propTypes = {
    invite: PropTypes.object,
    team: PropTypes.object,
    isLoggedIn: PropTypes.bool.isRequired,
    email: PropTypes.string,
    error: ''
  }
  state = {
    isJoinInFlight: false
  }
  join = () => {
    console.log('join');
    const { invite, team } = this.props;
    superagent.post(`team/${team.id}/join/${invite.id}`)
      .end((err, res) => {
        if (err) {
          console.log('error accepting invite:', res);
          this.state({ error: 'server-error' });
          return;
        }
        console.log('success accepting invite');
        this.props.history.push(`teams/${team.id}`);
      });
  }
  onJoinClick = () => {
    console.log('onJoinClick');
    if (!this.state.isJoinInFlight) {
      this.setState({ isJoinInFlight: true }, this.join);
    }
  }
  getLoginView = () => {
    const { team, isLoggedIn, email } = this.props;
    if (isLoggedIn) {
      return ([
        <p>You are logged in as <b>{email}</b>.</p>,
        <button
          className="btn-primary-inverse btn-large invite-accept-login-btn"
          type="button"
          onClick={this.onJoinClick}
        >
          Join {team.name ? team.name : 'Untitled team'} <i className="material-icons">group_add</i>
        </button>
      ]);
    } else {
      return ([
        <p>Please login with Google to accept.</p>,
        <button
          type="button"
          className="btn-primary-inverse btn-large invite-accept-login-btn"
          onClick={this.props.login}
        >
          <svg style={{ width: '30px', height: '30px', verticalAlign: 'top' }} viewBox="0 0 24 24">
              <path d="M23,11H21V9H19V11H17V13H19V15H21V13H23M8,11V13.4H12C11.8,14.4 10.8,16.4 8,16.4C5.6,16.4 3.7,14.4 3.7,12C3.7,9.6 5.6,7.6 8,7.6C9.4,7.6 10.3,8.2 10.8,8.7L12.7,6.9C11.5,5.7 9.9,5 8,5C4.1,5 1,8.1 1,12C1,15.9 4.1,19 8,19C12,19 14.7,16.2 14.7,12.2C14.7,11.7 14.7,11.4 14.6,11H8Z" />
          </svg> Login with Google
        </button>
      ]);
    }
  }
  render() {
    const { invite, team } = this.props;
    const { error } = this.state;
    const teamName = team.name ? team.name : 'Untitled team';
    return (
      <main role="main">
        <Helmet title="Accept Invite" />
        <div className="container text-center invite-accept-container">
          <header className="page-header">
            <h1 className="vanity-font">{(!invite.id || !team.id || invite.is_used) ? <span>Whoops 😬</span> : <span>You've been invited to join {teamName}!</span>}</h1>
          </header>
          <div className="page-body">
            {error === 'server-error'  && <p className="danger-text">There was a server error while attempting to accept the invite. If the problem persist please email <a href="mailto:support@goodchat.io">support@goodchat.io</a></p>}
            {(!invite.id || !team.id) && <p className="danger-text">This invite is invalid. Please reach out to your team admin to send a new invite. If the problem persist please email <a href="mailto:support@goodchat.io">support@goodchat.io</a></p>}
            {invite.is_used === true && <p className="danger-text">This invite is no longer valid. Please reach out to your team admin to send a new invite. If the problem persist please email <a href="mailto:support@goodchat.io">support@goodchat.io</a></p>}
            {!invite.is_used && invite.id && team.id && [
            <p>Congratulations! <b className="capitalize">{invite.host_given_name} {invite.host_family_name}</b> has invited you to join <b>{teamName}</b> on Good Chat.</p>,
            this.getLoginView()
            ]}
          </div>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    invite: state.invite.invite,
    team: state.team.team,
    isLoggedIn: state.user.isLoggedIn,
    email: state.user.email
  }), {
    setLoggedIn,
    login
  }
)(InviteAccept);
