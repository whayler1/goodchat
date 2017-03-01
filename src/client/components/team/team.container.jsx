import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import superagent from 'superagent';
import TeamMemberListItem from './team.member-list-item.component.jsx';
import TeamQuestions from './team.questions.container.jsx';
import { setTeam } from './team.dux.js';

import TeamHeader from './team.header.container.jsx';

import Helmet from "react-helmet";
import InputAutosize from 'react-input-autosize';

class Team extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    members: PropTypes.array.isRequired,
    setTeam: PropTypes.func.isRequired
  };

  state = {
    name: this.props.team.name || '',
    isNameSet: this.props.team.name ? true : false,
    isInFlight: false
  };

  resetState = team => this.setState({
    name: team.name || '',
    isNameSet: team.name ? true : false,
    isInFlight: false
  });

  onDeleteClick = () => {
    superagent.delete(`team/${this.props.params.teamId}`)
    .then(
      res => {
        console.log('delete success', res);
        this.props.history.push(`teams`);
      },
      err => console.log('error deleting team', err)
    );
  }

  onNameSubmit = e => {
    e.preventDefault();

    const { name, isInFlight } = this.state;

    if(!isInFlight && name && name.length > 1) {
      this.setState({ isInFlight: true }, () => superagent.put(`team/${this.props.team.id}`)
      .send({ name })
      .then(
        res => {
          console.log('success updating', res);
          this.props.setTeam(res.body.team);
          this.setState({
            isInFlight: false,
            isNameSet: true
          })
        },
        err => console.log('error updating team name')
      ))
    }
    return false;
  }

  onNameChange = e => this.setState({ name: e.target.value });

  areQuestionsSet = () => [
    this.props.team.question1,
    this.props.team.question2,
    this.props.team.question3,
    this.props.team.question4,
    this.props.team.question5
  ].every(question => question !== null)

  componentWillReceiveProps = nextProps => {
    const { team } = nextProps;

    if (team.id !== this.props.team.id) {
      console.log('nextprops.team.id !== this.props.team.id');
      this.resetState(team);
    }
  }

  render = () => {
    const {
      team,
      members
    } = this.props;
    const { is_owner, is_admin, id } = this.props.team;
    const { isNameSet } = this.state;

    console.log('members:', members);
    if (!isNameSet) {
      return  (
        <main className="main main-team-set-name" role="main">
          <div className="container">
            <form
              id="team-name"
              name="team-name"
              className="form"
              onSubmit={this.onNameSubmit}
            >
              <label htmlFor="name" className="vanity-font team-set-name-label">Name your new team</label>
              <InputAutosize
                id="name"
                name="name"
                type="text"
                minLength={2}
                maxLength={50}
                autoComplete="off"
                onChange={this.onNameChange}
                value={this.state.name}
                className="team-set-name-input"
                autoFocus
              />
              {this.state.name && this.state.name.length > 1 &&
              <div>
                <button type="submit" disabled={this.state.isInFlight} className="btn-no-style btn-large team-set-name-submit">Create Team <i className="material-icons">add_circle_outline</i></button>
              </div>}
            </form>
          </div>
        </main>
      );
    } else if ((is_owner || is_admin) && !this.areQuestionsSet()) {
      return (
        <main className="main main-team-set-questions" role="main">
          <div className="container">
            <h1 className="vanity-font">Questions</h1>
            <p>What do you want to ask members of <b>{this.state.name}</b>{'?'}</p>
            <p className="main-team-set-questions-footnote">Don't worry, you can continue to update these as your team evolves!</p>
            <TeamQuestions
              shouldHaveSubmit={true}
              team={team}
            />
          </div>
        </main>
      );
    } else {
      return (
        <div>
          <TeamHeader/>
          <main className="main main-team" role="main">
            <Helmet
              title={this.state.name}
            />
            <div className="container">
              <div className="col">
                <section className="card">
                  <header className="card-header">
                    <h3>Questions</h3>
                  </header>
                  <div className="card-padded-content">
                    <TeamQuestions
                      team={team}
                    />
                  </div>
                </section>
              </div>
              <div className="col">
                <section className="card">
                  <header className="card-header">
                  <h3>Team members</h3>
                  </header>
                  {(is_owner || is_admin) && members.length < 1 &&
                  <div className="card-padded-content"><p>This team has no members. Click below to invite team members.</p></div>}
                  {members.length > 0 &&
                  <ul className="card-body-list">
                    {members.map(member => <li key={member.id}>
                      <TeamMemberListItem
                        givenName={member.given_name}
                        familyName={member.family_name}
                        email={member.email}
                        picture={member.picture}
                        id={member.id}
                        teamId={team.id}
                      />
                    </li>)}
                  </ul>}
                  <footer className="card-padded-content">
                    <ul className="card-footer-btn-list">
                      {(is_owner || is_admin) &&
                      <li>
                        <Link className="btn-secondary btn-block" to={`teams/${id}/invite`}>
                          Invite team members <i className="material-icons">person_add</i>
                        </Link>
                      </li>}
                      {is_owner &&
                      <li>
                        <button className="btn-secondary btn-block" type="button" onClick={this.onDeleteClick}>
                          Delete this team <i className="material-icons">delete</i>
                        </button>
                      </li>}
                    </ul>
                  </footer>
                </section>
              </div>
            </div>
          </main>
          {this.props.children}
        </div>
      );
    }
  }
}

export default connect(
  state => {
    return {
      team: state.team.team,
      members: state.team.members.filter(member => member.id !== state.user.id)
    };
  },
  {
    setTeam
  }
)(Team);
