import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
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
  onDeleteClick = () => {
    console.log('onDeleteClick');
    superagent.delete(`team/${this.props.params.teamId}`)
    .then(
      res => {
        console.log('delete success', res);
        this.props.router.push(`teams`);
      },
      err => console.log('error deleting team', err)
    );
  }
  render() {
    const { is_owner, is_admin, id } = this.props.team;
    return (
      <main role="main">
        <header className="page-header">
          <form
            className="form"
            name="team-name-form"
            onSubmit={this.onTeamNameSubmit}
          >
            <div className={`input-group input-group-h1 ${ is_owner ? 'input-group-seamless' : 'input-group-cosmetic'}`}>
              <input
                className="form-control"
                type="text"
                name="name"
                placeholder="Untitled Team"
                maxLength={50}
                readOnly={!is_owner}
                value={this.state.name}
                autoComplete="off"
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
        <ul className="footer-btn-list">
          {(is_owner || is_admin) &&
          <li>
            <Link className="btn-secondary btn-block" to={`teams/${id}/invite`}>
              Invite team member <i className="material-icons">person_add</i>
            </Link>
          </li>}
          {is_owner &&
          <li>
            <button className="btn-secondary btn-block" type="button" onClick={this.onDeleteClick}>
              Delete this team <i className="material-icons">delete</i>
            </button>
          </li>}
        </ul>
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
