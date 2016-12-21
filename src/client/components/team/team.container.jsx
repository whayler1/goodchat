import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Team extends Component {
  static propTypes = {
    teams: PropTypes.array
  };
  render() {
    console.log('render:', this.props.teams);
    const {teams} = this.props;
    return (
      <main role="main">
        <h1>Team Page</h1>
        <ul>
          {teams.map(team => (
            <li key={team.id}>
              {team.id}
            </li>
          ))}
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
