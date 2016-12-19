import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {setTeams} from './team.dux';

class Team extends Component {
  static propTypes = {
    setTeams: PropTypes.func.isRequired
  };
  componentDidMount() {
    console.log('team mounted');
    this.props.setTeams();
  }
  render() {
    return (
      <main role="main">
        <h1>Team Page</h1>
      </main>
    );
  }
}

export default connect(
  state => ({}),
  {
    setTeams
  }
)(Team);
