import React, { Component, PropTypes } from 'react';
import Time from 'react-time';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import superagent from 'superagent';

import { setInvites } from '../invite/invite.dux';

class InviteListItem extends Component {
  static propTypes = {
    inviteId: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    inviteeEmail: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    setInvites: PropTypes.func.isRequired
  };
  state = {
    isInFlight: false
  }
  delete = () => {
    const { inviteId, teamId, setInvites } = this.props;

    superagent.delete(`invite/${inviteId}`).then(
      res => {
        superagent.get(`invite/${teamId}`).then(
          res => {
            setInvites(res.body.invites);
          },
          err => console.log('err retrieving invites', err)
        );
      },
      err => console.log('error deleting invite', err)
    );
  }
  onDeleteClick = () => {
    if (!this.state.isInFlight) {
      this.setState({ isInFlight: true }, this.delete);
    }
  }
  render() {
    const { inviteeEmail, updatedAt } = this.props;
    return (
      <div>
        <div>{inviteeEmail}</div>
        {/* subtract a few seconds from updatedAt because server time is slightly ahead */}
        <Time
          className="font-small"
          value={moment(updatedAt).subtract(3, 'seconds')}
          relative
          titleFormat="YYYY/MM/DD"
        />
        <ul className="pending-invite-list-ui-list">
          <li>
            <button
              className="btn-icon btn-icon-danger"
              type="button"
              onClick={this.onDeleteClick}
            >
              <i className="material-icons">delete</i>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

class TeamInvite extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    invites: PropTypes.array.isRequired,
    setInvites: PropTypes.func.isRequired
  }
  state = {
    email: '',
    isAdmin: false,
    emailError: '',
    isInFlight: false
  }
  validate = () => {
    const { email } = this.state;
    if (email.trim() === '') {
      this.setState({ emailError: 'empty' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      this.setState({ emailError: 'invalid' });
      return;
    }
    this.setState({ emailError: '', isInFlight: true }, this.submit);
  }
  submit = () => {
    const { email, isAdmin } = this.state;

    superagent.post('invite')
      .send({
        invitee_email: email,
        team_id: this.props.team.id,
        is_admin: isAdmin
      })
      .end((err, res) => {
        if (err) {
          console.log('err:', err, '\nres:', res);
          if (res.body.msg === 'email-exists') {
            this.setState({
              isInFlight: false,
              emailError: 'exists'
            });
          }
        } else {
          console.log('invite success!', res);
          superagent.get(`invite/${this.props.team.id}`).then(
            res => {
              this.props.setInvites(res.body.invites);
              this.setState({ isInFlight: false, email: '', emailError: '' });
            },
            err => console.log('err retrieving invites')
          );
        }
      });
  }
  onSubmit = e => {
    e.preventDefault();
    if (!this.state.isInFlight) {
      this.validate();
    }
    return false;
  }
  onChange = e => this.setState({
    [e.target.name]: e.target.value
  });
  render() {
    const { name, id } = this.props.team;
    const { invites } = this.props;
    const { emailError } = this.state;
    console.log('%cteam invite\ninvites:', 'background:pink', this.props.invites);
    return (
      <main role="main">
        <header className="page-header">
          <h1>{ name ? name : 'Untitled Team' }</h1>
          <h2>Invites</h2>
        </header>
        <div className="page-body">
          <h3>Invite a team member</h3>
          <form
            name="invite-team-member-form"
            onSubmit={this.onSubmit}
            className="form"
            noValidate
          >
            <fieldset className={ emailError ? 'input-error' : '' }>
              <label className="input-label" htmlFor="email">Invitee email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane.doe@gmail.com"
                className="form-control"
                maxLength={50}
                value={this.state.email}
                autoComplete="off"
                onChange={this.onChange}
              />
              {emailError &&
              <p className="input-error-msg">
                {emailError === 'invalid' && 'Please provide a valid email.'}
                {emailError === 'empty' && 'Please provide an email.'}
                {emailError === 'exists' && 'This email has already been invited.'}
              </p>
              }
            </fieldset>
            <fieldset>
              <label htmlFor="isAdmin">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                /> Admin
              </label>
            </fieldset>
            <fieldset>
              <button
                type="submit"
                className="btn-primary-inverse btn-block"
              >
                Send Invite
              </button>
            </fieldset>
          </form>
          {invites.length > 0 && [
          <h3>Pending invites</h3>,
          <ul className="page-body-list pending-invite-list">
            {invites.map(invite => (
              <li key={invite.id}>
                <InviteListItem
                  inviteId={invite.id}
                  teamId={id}
                  inviteeEmail={invite.invitee_email}
                  updatedAt={invite.updated_at}
                  setInvites={this.props.setInvites}
                />
              </li>
            ))}
          </ul>]}
        </div>
        <ul className="footer-btn-list">
          <li>
            <Link className="btn-secondary btn-block" to={`teams/${id}`}>
              Close
            </Link>
          </li>
        </ul>
      </main>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team,
    invites: state.invite.invites.sort((a, b) => a.created_at < b.created_at)
  }),
  {
    setInvites
  }
)(TeamInvite);
