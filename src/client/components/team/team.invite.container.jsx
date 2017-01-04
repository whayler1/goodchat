import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import superagent from 'superagent';

class TeamInvite extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired
  }
  onSubmit = e => {
    e.preventDefault();

    return false;
  }
  render() {
    const { name } = this.props.team;
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
          >
            <label htmlFor="email">Invitee email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jane.doe@gmail.com"
              className="form-control"
            />
            <button
              type="submit"
              className="btn-primary-inverse btn-block"
            >
              Send Invite
            </button>
          </form>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team
  })
)(TeamInvite);
