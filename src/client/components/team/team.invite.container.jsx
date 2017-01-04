import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import superagent from 'superagent';

class TeamInvite extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired
  }
  state = {
    email: '',
    isAdmin: false
  }
  onSubmit = e => {
    e.preventDefault();
    const { email, isAdmin } = this.state;

    console.log('submit\nemail:', email, '\nisAdmin:', isAdmin);

    superagent.post('invite')
      .send({
        invitee_email: email,
        team_id: this.props.team.id,
        is_admin: isAdmin
      })
      .then(
        res => {
          console.log('invite success!', res);
        },
        err => console.log('err', err)
      );
    return false;
  }
  onChange = e => this.setState({
    [e.target.name]: e.target.value
  });
  render() {
    const { name, id } = this.props.team;
    console.log('%cteam invite', 'background:pink');
    return (
      <main role="main">
        <header className="page-header">
          <h1>{ name ? name : 'Untitled Team' }</h1>
          <h2>Invite a team member</h2>
        </header>
        <div className="page-body">
          <form
            name="invite-team-member-form"
            onSubmit={this.onSubmit}
            className="form"
            noValidate
          >
            <fieldset>
              <label htmlFor="email">Invitee email</label>
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
    team: state.team.team
  })
)(TeamInvite);
