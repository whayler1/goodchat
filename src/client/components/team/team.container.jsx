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
        {teams.length > 0 && <ul>
          {teams.map(team => (
            <li key={team.id}>
              {team.id}
            </li>
          ))}
        </ul>}
        {teams.length < 1 && <p>You do not belong to any teams.</p>}
        <ul className="footer-btn-list">
          <li>
            <button className="btn-primary-inverse btn-block" type="button">
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
