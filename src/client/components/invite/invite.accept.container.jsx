import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import superagent from 'superagent';
import Helmet from 'react-helmet';

import { setLoggedIn } from '../user/user.dux.js';

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
      return (
        <p>Please login with Google to accept.</p>
      );
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
    setLoggedIn
  }
)(InviteAccept);
