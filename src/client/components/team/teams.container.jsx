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
        console.log('on create team', this.props);
        analytics.track('create-team', {
          category: 'team',
          teamId: res.body.team.id
        });
        this.props.history.push(`teams/${res.body.team.id}`);
      },
      err => {
        console.log('create team err :(', err);
      }
    );
  }
  render() {
    const { teams } = this.props;
    return (
      <main className="main" role="main" id="main-teams">
        <Helmet
          title="My teams"
        />
        <div className="container">
          <section className="card">
            <header className="card-header">
              <h3>My Teams</h3>
            </header>
            {teams.length > 0 &&
            <ul className="card-body-list">
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
            <div className="card-padded-content">
              <p><b>You don&rsquo;t belong to any teams yet!</b></p>
              <p>But don&rsquo;t worry, there&rsquo;s hope 😀. Create your own team or join an existing one below.</p>
            </div>}
            <footer className="card-padded-content">
              <ul className="card-footer-btn-list">
                <li>
                  <button
                    className="btn-primary-inverse btn-block"
                    type="button"
                    id="btn-create-team"
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
            </footer>
          </section>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    teams: state.team.teams
  })
)(Teams);
