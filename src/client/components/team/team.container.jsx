import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import superagent from 'superagent';
import TeamMemberListItem from './team.member-list-item.component.jsx';
import TeamQuestions from './team.questions.container.jsx';
import Dropdown from '../dropdown/dropdown.component.jsx';
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

  getDropdownContent = () => {
    return (
      <ul className="dropdown-list">
        <li>
          <button type="button" className="btn-no-style btn-no-style-danger nowrap" onClick={this.onDeleteClick}>
            Delete this team <i className="material-icons">delete</i>
          </button>
        </li>
      </ul>
    );
  };

  onDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${this.state.name}? This can not be undone.`)) {
      superagent.delete(`team/${this.props.params.teamId}`)
      .then(
        res => {
          console.log('delete success', res);
          this.props.history.push(`teams`);
        },
        err => console.log('error deleting team', err)
      );
    }
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
    const unscheduledMembers = members.filter(member => !('next_meeting_date' in member));
    const upcomingMembers = members.filter(member => 'next_meeting_date' in member);

    if (is_owner || is_admin) {
      members.sort((a, b) => {
        const nextMeetingA = a.next_meeting_date || '';
        const nextMeetingB = b.next_meeting_date || '';
        if (nextMeetingA < nextMeetingB) {
          return -1;
        }
        if (nextMeetingA > nextMeetingB) {
          return 1;
        }
        return 0;
      });
    } else {
      members.sort((a, b) => {
        const nextMeetingA = a.next_meeting_date;
        const nextMeetingB = b.next_meeting_date;
        if (!nextMeetingA || (nextMeetingA > nextMeetingB)) {
          return 1
        }
        if (nextMeetingA < nextMeetingB) {
          return -1;
        }
        return 0;
      });
    }

    if (!isNameSet) {
      return  (
        <main className="main main-team-set-name" role="main">
          <Helmet title="Name your new team"/>
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
          <Helmet
            title={`Set Questions for ${this.state.name}`}
          />
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
        <main className="main main-team" role="main">
          <Helmet
            title={`${this.state.name} | Good Chat`}
          />
          <div className="container">
            <div className="main-team-header">
              <h1>{this.state.name}</h1>
              {is_owner &&
              <Dropdown
                label={<button type="button" className="btn-main-team-more"><i className="material-icons">more_horiz</i></button>}
                content={this.getDropdownContent()}
                isRightAligned={true}
              />}
            </div>
          </div>
          <div className="main-team-container">

            {(is_owner || is_admin) && members.length < 1 && [
            <h3 className="team-member-list-title vanity-font">Create your team</h3>,
            <p>This team has no members.<br/><b>Click below</b> to invite team members.</p>]}
            {members.length > 0 && [
            <h3 className="team-member-list-title vanity-font">Meetings</h3>,
            <ul className="team-member-list">
              {members.map(member => <li key={member.id}>
                <TeamMemberListItem
                  givenName={member.given_name}
                  familyName={member.family_name}
                  email={member.email}
                  picture={member.picture}
                  id={member.id}
                  teamId={team.id}
                  nextMeetingDate={member.next_meeting_date}
                />
              </li>)}
            </ul>]}
            {(is_owner || is_admin) &&
            <Link className="btn-no-style btn-no-style-primary btn-block btn-team-invite" to={`teams/${id}/invite`}>
              Invite team members <i className="material-icons">person_add</i>
            </Link>}
          </div>
          {this.props.children}
        </main>
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
