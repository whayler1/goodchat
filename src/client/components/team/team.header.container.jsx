import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import superagent from 'superagent';

import InputAutosize from 'react-input-autosize';

class TeamHeader extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired
  }
  state = {
    name: this.props.team.name || ''
  }

  submit = _.debounce(() => {
    superagent.put(`team/${this.props.team.id}`)
    .send({ name: this.state.name })
    .then(
      res => {
        console.log('success updating', res);
      },
      err => console.log('error updating team name')
    );
  }, 500);

  onTeamNameSubmit = e => {
    e.preventDefault();
    this.submit();
    return false;
  };

  onChange = e => {
    const { value, name } = e.target;
    this.setState({ [name]: value }, this.submit);
  };

  resetState = team => this.setState({
    name: team.name || ''
  });

  componentWillReceiveProps = nextProps => {
    const { team } = nextProps;

    if (team.id !== this.props.team.id) {
      this.resetState(team);
    }
  }

  render = () => {
    console.log('TeamHeader render');
    const { is_owner } = this.props.team;

    return (
      <header className="page-header">
        <div className="container">
          <form
            className="form"
            name="team-name-form"
            onSubmit={this.onTeamNameSubmit}
          >
            {is_owner && <InputAutosize
              className="team-header-title"
              type="text"
              name="name"
              placeholder="Untitled Team"
              maxLength={50}
              value={this.state.name}
              autoComplete="off"
              onChange={this.onChange}
            />}
            {!is_owner && <h2 className="team-header-title">{this.state.name}</h2>}
          </form>
        </div>
      </header>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team
  })
)(TeamHeader);
