import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class TeamId extends Component {
  static propTypes = {
    teams: PropTypes.array,
    team: PropTypes.object
  };
  defaultProps = {
    team: this.props.teams.find(team => team.id === this.props.params.teamId)
  }
  render() {
    console.log('teamId:', this.props.params.teamId);
    console.log('teams', this.props.teams);
    console.log('team', this.props.team);
    return (
      <main role="main">
        <header className="page-header">
          <h1>Specific Team</h1>
        </header>
        <div class="page-body">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    teams: state.team.teams
  }),
  {}
)(TeamId);
