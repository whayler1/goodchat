import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';

import superagent from 'superagent';

class Team extends Component {
  static propTypes = {
    teams: PropTypes.array
  };
  onCreateTeam = () => {
    console.log('onCreateTeam');
    superagent.post('team').then(
      res => {
        console.log('create team superagent success', res);
      },
      err => {
        console.log('create team err :(', err);
      }
    );
  }
  render() {
    console.log('render:', this.props.teams);
    const {teams} = this.props;
    return (
      <main role="main">
        <header className="page-header">
          <h1>My Teams</h1>
        </header>
        {teams.length > 0 &&
        <ul>
          {teams.map(team => (
            <li key={team.id}>
              <Link to={`/team/${team.id}`}>
                {team.name &&
                <span>{team.name}</span>}
                {!team.name &&
                <span>Untitled team</span>}
              </Link>
            </li>
          ))}
        </ul>}
        {teams.length < 1 &&
        <div className="page-body">
          <p>You don&rsquo;t belong to any teams yet! But don&rsquo;t worry, there&rsquo;s hope 😀. Create your own team or join an existing one below.</p>
        </div>}
        <ul className="footer-btn-list">
          <li>
            <button
              className="btn-primary-inverse btn-block"
              type="button"
              onClick={this.onCreateTeam}>
              Create a new team <i className="material-icons">add</i>
            </button>
          </li>
          <li>
            <button className="btn-secondary btn-block" type="button">
              Join an existing team <i className="material-icons">group_add</i>
            </button>
          </li>
        </ul>
      </main>
    );
  }
}

export default connect(
  state => ({
    teams: state.team.teams
  })
)(Team);
