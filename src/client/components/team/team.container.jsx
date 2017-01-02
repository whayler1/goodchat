import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import superagent from 'superagent';
import _ from 'underscore';

class Team extends Component {
  static propTypes = {
    team: PropTypes.array.isRequired
  };
  state = {
    name: this.props.team.name || ''
  };
  onTeamNameSubmit = e => {
    e.preventDefault();
    this.submit();
    return false;
  };
  submit = _.debounce(() => {
    console.log('debounce func');
    superagent.put(`team/${this.props.params.teamId}`)
    .send({ name: this.state.name })
    .then(
      res => {
        console.log('success updating', res);
      },
      err => console.log('error updating team name')
    );
  }, 500);
  onChange = e => {
    const { value, name } = e.target;
    console.log('onChange', value);
    this.setState({ [name]: value }, this.submit);
  };
  render() {
    // const { name } = this.state.team;
    return (
      <main role="main">
        <header className="page-header">
          <form
            className="form"
            name="team-name-form"
            onSubmit={this.onTeamNameSubmit}
          >
            <div className="input-group input-group-seamless input-group-h1">
              <input
                className="form-control"
                type="text"
                name="name"
                placeholder="Untitled Team"
                maxLength={50}
                value={this.state.name}
                onChange={this.onChange}
              />
              <span className="input-group-addon">
                <i className="material-icons">mode_edit</i>
              </span>
            </div>
          </form>
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
    team: state.team.team
  }),
  {}
)(Team);
