import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Team extends Component {
  static propTypes = {
    teams: PropTypes.array.isRequired
  };
  componentWillMount() {
    console.log('%c - mounted', 'background:aqua', this.props.teams);
    this.setState({
      team: this.props.teams.find(team => team.id === this.props.params.teamId)
    })
  }
  render() {
    console.log('teamId:', this.props.params.teamId);
    console.log('teams', this.props.teams);
    console.log('team', this.state.team);
    const { name } = this.state.team;
    // console.log('team find:', this.props.teams.find(team => team.id === this.props.params.teamId));
    return (
      <main role="main">
        <header className="page-header">
          {name && <h1>{name}</h1>}
          {!name && <h1>Untitled Team</h1>}
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
)(Team);
