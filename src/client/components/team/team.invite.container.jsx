import React, { Component, PropTypes } from 'react';
import Time from 'react-time';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import superagent from 'superagent';
import { setInvites } from '../invite/invite.dux';
import TeamHeader from './team.header.container.jsx';
import Helmet from "react-helmet";
import Modal from '../modal/modal.container.jsx';

class InviteListItem extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
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
        superagent.get(`team/${teamId}/invite`).then(
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
    const { inviteeEmail, updatedAt, index, id } = this.props;
    return (
      <div>
        <div id={`invitee-${index}-email`}>{inviteeEmail}</div>
        <input
          type="hidden"
          value={id}
          id={`invitee-${index}-invite-id`}
        />
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
          superagent.get(`team/${this.props.team.id}/invite`).then(
            res => {
              analytics.track('send-invite', {
                category: 'team',
                teamId: this.props.team.id
              })
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

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  onCheckboxChange = e => this.setState({ [e.target.name]: e.target.checked });

  closeFunc = () => this.props.history.push(`teams/${this.props.team.id}`)

  render() {
    const { name, id } = this.props.team;
    const { invites } = this.props;
    const { emailError } = this.state;
    console.log('%cteam invite\nstate:', 'background:pink', this.state);
    return (
      <Modal closeFunc={this.closeFunc}>
        <Helmet title={`${name} invites`} />
        <section className="card">
          <header className="card-header">
            <h3>Invite a team member</h3>
            <div className="card-header-close">
              <Link to={`teams/${id}`}>
                <i className="material-icons">close</i>
              </Link>
            </div>
          </header>
          <div className="card-padded-content">
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
                  autoFocus
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
                    type="checkbox"
                    id="isAdmin"
                    name="isAdmin"
                    checked={this.state.isAdmin}
                    onChange={this.onCheckboxChange}
                  /> Admin
                </label>
              </fieldset>
              <fieldset>
                <button
                  id="btn-send-invite"
                  type="submit"
                  className="btn-primary-inverse btn-block"
                >
                  Send Invite
                </button>
              </fieldset>
            </form>
          </div>
          {invites.length > 0 &&
          <div className="card-padded-content">
            <h3>Pending invites</h3>
            <ul className="card-body-list pending-invite-list">
              {invites.map((invite, index) => (
                <li key={invite.id}>
                  <InviteListItem
                    id={invite.id}
                    index={index}
                    inviteId={invite.id}
                    teamId={id}
                    inviteeEmail={invite.invitee_email}
                    updatedAt={invite.updated_at}
                    setInvites={this.props.setInvites}
                  />
                </li>
              ))}
            </ul>
          </div>}
          <footer className="card-padded-content">
            <Link id="btn-close-invite-modal" className="btn-secondary btn-block" to={`teams/${id}`}>Close</Link>
          </footer>
        </section>
      </Modal>
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
