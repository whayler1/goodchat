import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import superagent from 'superagent';
import _ from 'lodash';

import { getMeetings } from '../meeting/meeting.dux.js';
import { updateTeamMembers, createMeeting } from '../team/team.dux.js';
import { createTodo, updateTodo, deleteTodo } from '../meeting/meeting.dux.js';

import TeamMemberDetailMeeting from './team.member-detail.meeting.container.jsx';
import questionDefaults from '../../questions/questions.js';
import TeamHeader from './team.header.container.jsx';
import TeamMemberDetailTodoList from './team.member-detail.todo-list.component.jsx';
import Helmet from 'react-helmet';
import { StickyContainer, Sticky } from 'react-sticky';

class TeamMemberDetail extends Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired,
    meetings: PropTypes.array.isRequired,
    meetingGroup: PropTypes.object.isRequired,
    members: PropTypes.array,
    getMeetings: PropTypes.func.isRequired,
    setMembers: PropTypes.func.isRequired,
    givenName: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    updateTeamMembers: PropTypes.func.isRequired,
    createMeeting: PropTypes.func.isRequired,
    todos: PropTypes.array.isRequired,
    createTodo: PropTypes.func.isRequired,
    updateTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
  }

  state = {
    member: {},
    now: moment(),
    newMeetingDateTime: `${moment().add(7, 'd').format('YYYY-MM-DD')}T14:00`,
    newMeetingDateTimeError: '',
    isScheduleMeetingSelected: false
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  validate = () => new Promise((resolve, reject) => {
    const { newMeetingDateTime, now } = this.state;

    if (!newMeetingDateTime) {
      this.setState({ newMeetingDateTimeError: 'doesnt-exist' }, reject);
    } else if (moment(newMeetingDateTime).isBefore(now)) {
      this.setState({ newMeetingDateTimeError: 'before-now' }, reject);
    } else {
      this.setState({ newMeetingDateTimeError: '' }, resolve)
    }
  })

  getMeetings = () => this.props.getMeetings(this.props.team.id, this.props.params.meetingGroupId);

  submit = () => {
    const { team, createMeeting, params } = this.props;
    const {
      question1,
      question2,
      question3,
      question4,
      question5
    } = team;
    const {
      newMeetingDateTime
    } = this.state;

    const meeting_date = moment(newMeetingDateTime).toISOString();
    const sendObj = { meeting_date };

    if (team.is_admin || team.is_owner) {
      Object.assign(sendObj, {
        question1: question1 || questionDefaults[0][0],
        question2: question2 || questionDefaults[1][0],
        question3: question3 || questionDefaults[2][0],
        question4: question4 || questionDefaults[3][0],
        question5: question5 || questionDefaults[4][0]
      });
    } else {
      Object.assign(sendObj, { qa_length: 1 });
    }

    createMeeting(team.id, params.meetingGroupId, sendObj).then(
      () => {
        this.getMeetings();
        this.props.updateTeamMembers(team.id);
      },
      err => console.log('error creating team')
    );
  }

  onSubmit = e => {
    e.preventDefault();

    this.validate().then(
      () => {
        analytics.track('schedule-meeting', {
          category: 'meeting',
          teamId: this.props.team.id
        });
        this.submit()
      },
      () => console.log('rejected validation', this.state)
    );

    return false;
  }

  onStartMeetingNow = () => this.setState({ newMeetingDateTime: moment().toISOString() }, () => {
    analytics.track('start-meeting-now', {
      category: 'meeting',
      teamId: this.props.team.id
    });
    this.submit();
  });

  modalCloseFunc = () => this.props.history.push(`teams/${this.props.team.id}`);

  updateTodo = _.debounce((todoId, options) => this.props.updateTodo(todoId, options), 750);

  onTodoCheckboxChange = (todoId, isDone) => this.setState({ [`todo-isdone-${todoId}`]: isDone }, () => this.updateTodo(todoId, { is_done: isDone }));

  onTodoTextChange = (todoId, text) => this.setState({ [`todo-text-${todoId}`]: text }, () => this.updateTodo(todoId, { text }));

  componentWillUpdate = (nextProps) => {
    if (nextProps.todos.length !== this.props.todos.length) {
      const stateObj = {};

      nextProps.todos.forEach(todo => {
        if (!(`todo-text-${todo.id}` in this.state) && !(`todo-isdone-${todo.id}` in this.state)) {
          Object.assign(stateObj, {
            [`todo-text-${todo.id}`]: todo.text,
            [`todo-isdone-${todo.id}`]: todo.is_done
          });
        }
      });
      this.setState(stateObj);
    }
  }

  componentWillMount = () => {
    const { meetingGroup, userId, members, todos } = this.props;
    const memberId = meetingGroup.memberships.find(membership => membership.user_id !== userId).user_id;
    const member = members.find(member => member.id === memberId);

    const stateObj = { member };

    todos.forEach(todo => {
      stateObj[`todo-isdone-${todo.id}`] = todo.is_done;
      stateObj[`todo-text-${todo.id}`] = todo.text;
    });

    this.setState(stateObj);
  };

  render = () => {
    const { team, meetings, meetingGroup, imageUrl, history, todos, createTodo, updateTodo, deleteTodo } = this.props;
    const { member, newMeetingDateTime, newMeetingDateTimeError, isScheduleMeetingSelected } = this.state;
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
    } = team;
    const canCreateNewMeeting = meetings.length < 1 || (meetings.length > 0 && meetings[0].is_done);
    const todoStates = _.pick(this.state, Object.keys(this.state).filter(key => /todo/.test(key)));

    return (
      <div>
        <Helmet title={`Meetings with ${member.given_name} ${member.family_name} | Good Chat`} />
        <header className="page-header">
          <Link to={`teams/${team.id}`} className="page-header-back-link">
            <i className="material-icons">chevron_left</i><span>{team.name}</span>
          </Link>
          <h1 className="vanity-font center strong-text">Meetings with <span className="nowrap">{member.given_name} {member.family_name}</span></h1>
        </header>
        <div className="page-layout">
          <div className="page-row">
            {meetings.length > 0 &&
            <aside className="aside aside-team-meeting">
              <StickyContainer className="aside-team-meeting-sticky-container">
                <Sticky className="aside-team-meeting-sticky">
                  <section>
                    <h3>To-do's</h3>
                    <TeamMemberDetailTodoList
                      teamId={team.id}
                      meetingId={meetings[0].id}
                      meetingGroupId={meetingGroup.id}
                      todos={todos}
                      createTodo={createTodo}
                      deleteTodo={deleteTodo}
                      todoStates={todoStates}
                      onTodoCheckboxChange={this.onTodoCheckboxChange}
                      onTodoTextChange={this.onTodoTextChange}
                    />
                  </section>
                </Sticky>
              </StickyContainer>
            </aside>}
            <main className="main main-team-meeting" role="main">
              <section className="card">
                {canCreateNewMeeting &&
                <div className="team-card-subheader team-card-subheader-create-meeting">
                  <div className="meeting-header">
                    <div className="meeting-header-lg-icon-wrapper">
                      <i className="material-icons meeting-header-lg-icon">note_add</i>
                    </div>
                    <div className="meeting-header-lg-content">
                      <h1 className="meeting-header-title">Create meeting</h1>
                    </div>
                  </div>
                  <form className="form" onSubmit={this.onSubmit}>
                    {isScheduleMeetingSelected && [
                    <fieldset className={newMeetingDateTimeError ? 'input-error' : ''}>
                      <label
                        htmlFor="newMeetingDateTime"
                        className="input-label"
                      >Meeting date and time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="newMeetingDateTime"
                        name="newMeetingDateTime"
                        value={newMeetingDateTime}
                        onChange={this.onChange}
                        autoFocus
                      />
                      {newMeetingDateTimeError &&
                      <p className="input-error-msg">
                        {newMeetingDateTimeError === 'doesnt-exist' && 'Please provide a date and time.'}
                        {newMeetingDateTimeError === 'before-now' && 'New meeting must be in the future.'}
                      </p>
                      }
                    </fieldset>,
                    <fieldset className="align-right">
                      <ul className="stacked-to-inline-list">
                        <li className="hide-handheld">
                          <button
                            type="button"
                            className="btn-no-style btn-no-style-secondary"
                            onClick={() => this.setState({ isScheduleMeetingSelected: false })}
                          >Cancel</button>
                        </li>
                        <li>
                          <button
                            type="submit"
                            className="btn-primary btn-block"
                          >Schedule meeting</button>
                        </li>
                        <li className="hide-tablet">
                          <button
                            type="button"
                            className="btn-no-style btn-no-style-secondary"
                            onClick={() => this.setState({ isScheduleMeetingSelected: false })}
                          >Cancel</button>
                        </li>
                      </ul>
                    </fieldset>]}
                    {!isScheduleMeetingSelected &&
                    <fieldset className="align-right">
                      <ul className="stacked-to-inline-list">
                        <li>
                          <button
                            type="button"
                            className="btn-primary-inverse btn-block"
                            onClick={() => this.setState({ newMeetingDateTime: `${moment().add(7, 'd').format('YYYY-MM-DD')}T14:00`, isScheduleMeetingSelected: true })}
                          >
                            Schedule meeting
                          </button>
                        </li><li>
                          <button
                            id="btn-start-meeting-now"
                            type="button"
                            className="btn-primary btn-block"
                            onClick={this.onStartMeetingNow}
                            autoFocus
                          >
                            Start meeting now
                          </button>
                        </li>
                      </ul>
                    </fieldset>
                    }
                  </form>
                </div>
                }
                {meetings.length > 0 && !meetings[0].is_done &&
                <ul className="team-card-body-list">
                  <li key={meetings[0].id}>
                    <TeamMemberDetailMeeting
                      meeting={meetings[0]}
                      todos={todos.filter(todo => todo.meeting_id === meetings[0].id)}
                      imageUrl={imageUrl}
                      memberImageUrl={member.picture}
                      memberId={member.id}
                      history={history}
                      onTodoCheckboxChange={this.onTodoCheckboxChange}
                      onTodoTextChange={this.onTodoTextChange}
                      todoStates={todoStates}
                    />
                  </li>
                </ul>}
              </section>
              {meetings.length > 1 && <h3 className="meeting-subhead">Previous meetings</h3>}
              {meetings.filter(meeting => meeting.is_done).map(meeting => (
              <TeamMemberDetailMeeting
                key={meeting.id}
                className="card meeting-card"
                meeting={meeting}
                todos={todos.filter(todo => todo.meeting_id === meeting.id)}
                imageUrl={imageUrl}
                memberImageUrl={member.picture}
                memberId={member.id}
                history={history}
                onTodoCheckboxChange={this.onTodoCheckboxChange}
                onTodoTextChange={this.onTodoTextChange}
                todoStates={todoStates}
              />
              ))}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    userId: state.user.id,
    team: state.team.team,
    meetings: _.orderBy(state.meeting.meetings, 'created_at', 'desc'),
    meetingGroup: state.meeting.meetingGroup,
    members: state.team.members,
    givenName: state.user.givenName,
    familyName: state.user.familyName,
    imageUrl: state.user.imageUrl,
    todos: _.orderBy(state.meeting.todos, 'created_at')
  }),
  {
    getMeetings,
    updateTeamMembers,
    createMeeting,
    createTodo,
    updateTodo,
    deleteTodo
  }
)(TeamMemberDetail);
