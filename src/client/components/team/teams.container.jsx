import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Router, { Link } from 'react-router';

import superagent from 'superagent';

import Helmet from "react-helmet";

class Teams extends Component {
  static propTypes = {
    teams: PropTypes.array,
    browserHistory: PropTypes.array
  };
  onCreateTeam = () => {
    superagent.post('team').then(
      res => {
        this.props.router.push(`teams/${res.body.team.id}`);
      },
      err => {
        console.log('create team err :(', err);
      }
    );
  }
  render() {
    const { teams } = this.props;
    return (
      <main className="main" role="main">
        <Helmet
          title="My teams"
        />
        <header className="page-header">
          <h1>My Teams</h1>
        </header>
        {teams.length > 0 &&
        <ul className="page-body-list">
          {teams.map(team => (
            <li key={team.id}>
              <Link to={`/teams/${team.id}`}>
                {team.name &&
                <span>{team.name}</span>}
                {!team.name &&
                <span>Untitled team</span>}
                <i className="material-icons pull-right">chevron_right</i>
              </Link>
            </li>
          ))}
        </ul>}
        {teams.length < 1 &&
        <div className="page-body">
          <p><b>You don&rsquo;t belong to any teams yet!</b></p>
          <p>But don&rsquo;t worry, there&rsquo;s hope 😀. Create your own team or join an existing one below.</p>
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
)(Teams);
