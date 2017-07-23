import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import superagent from 'superagent';
import _ from 'lodash';
import calendarHelpers from '../calendar/helpers';
console.log('helpers', calendarHelpers);

import { getMeetings } from '../meeting/meeting.dux.js';
import { updateTeamMembers, createMeeting } from '../team/team.dux.js';
import { createTodo, updateTodo, deleteTodo, updateMeeting } from '../meeting/meeting.dux.js';
import { getEvents, createEvent } from '../calendar/calendar.dux';

import TeamMemberDetailMeeting from './team.member-detail.meeting.container.jsx';
import questionDefaults from '../../questions/questions.js';
import TeamHeader from './team.header.container.jsx';
import TeamMemberDetailTodoList from './team.member-detail.todo-list.component.jsx';
import Helmet from 'react-helmet';
import Modal from '../modal/modal.container.jsx';
import TeamMemberDetailSchedule from './team.member-detail.schedule.container.jsx';
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
    updateMeeting: PropTypes.func.isRequired,
    todos: PropTypes.array.isRequired,
    createTodo: PropTypes.func.isRequired,
    updateTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    getEvents: PropTypes.func.isRequired,
    createEvent: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired
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

  submit = () => new Promise((resolve, reject) => {
    const { team, createMeeting, params } = this.props;
    const {
      question1,
      question2,
      question3,
      question4,
      question5
    } = team;
    const {
      newMeetingDateTime,
      googleCalendarEventId,
      isInviteSent
    } = this.state;

    const meeting_date = moment(newMeetingDateTime).toISOString();
    const sendObj = { meeting_date };

    if (googleCalendarEventId) {
      Object.assign(sendObj, { google_calendar_event_id: googleCalendarEventId });
    }
    if (isInviteSent) {
      Object.assign(sendObj, { is_invite_sent: true });
    }

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
        this.getMeetings().then(() => resolve());
        this.props.updateTeamMembers(team.id);
      },
      err => {
        alert('error creating meeting');
        reject();
      }
    );
  })

  onSubmit = e => {
    e.preventDefault();

    this.validate().then(
      () => {
        window.analytics.track('schedule-meeting', {
          category: 'meeting',
          teamId: this.props.team.id
        });
        this.submit()
      },
      () => console.log('rejected validation', this.state)
    );

    return false;
  }

  onScheduleSubmit = (newMeetingDateTime, googleCalendarEventId, isInviteSent) =>
    this.setState({ newMeetingDateTime, googleCalendarEventId, isInviteSent }, () => {
      const { meetings } = this.props;
      if (meetings.length && !meetings[0].is_done) {
        this.props.updateMeeting(meetings[0].id, { meeting_date: moment(newMeetingDateTime).toISOString() }).then(() => this.setState({ isScheduleMeetingSelected: false, googleCalendarEventId: null, isInviteSent: false }));
      } else {
        this.submit().then(() => this.setState({ isScheduleMeetingSelected: false, googleCalendarEventId: null, isInviteSent: false }));
      }
    });

  onStartMeetingNow = () => this.setState({ newMeetingDateTime: moment().toISOString() }, () => {
    const { givenName, familyName, team, meetingGroup } = this.props;
    const { member } = this.state;
    const {
      dateTimeFormat,
      getSummary,
      getDescription,
      getTimeZone,
      getOptions
    } = calendarHelpers;

    window.analytics.track('start-meeting-now', {
      category: 'meeting',
      teamId: team.id
    });

    this.setState({ isStartNowInFlight: true }, () => this.props.createEvent(
      getSummary(givenName, familyName, member.given_name, member.family_name),
      getDescription(team.id, meetingGroup.id),
      moment().format(dateTimeFormat),
      moment().add(30, 'minutes').seconds(0).format(dateTimeFormat),
      getTimeZone(),
      false,
      getOptions(member.email)
    ).then(
      (event) => this.setState({ googleCalendarEventId: event.id },
        () => this.submit().then(() => this.setState({
          googleCalendarEventId: null,
          isStartNowInFlight: false
        }))),
      () => console.error('error creating event')
    ));
  });

  updateTodo = _.debounce((todoId, options) => this.props.updateTodo(todoId, options).then(
      () => window.analytics.track('update-todo', _.omitBy(_.pick(options, 'text', 'is_done'), _.isNil)),
      () => window.analytics.track('update-todo-error')
    ), 750);

  onTodoCheckboxChange = (todoId, isDone) => this.setState({ [`todo-isdone-${todoId}`]: isDone }, () => this.updateTodo(todoId, { is_done: isDone }));

  onTodoTextChange = (todoId, text) => this.setState({ [`todo-text-${todoId}`]: text }, () => this.updateTodo(todoId, { text }));

  toggleScheduleMeetingSelected = () => this.setState({ isScheduleMeetingSelected: !this.state.isScheduleMeetingSelected }, () =>
    window.analytics.track(this.state.isScheduleMeetingSelected ? 'schedule-meeting-closed' : 'schedule-meeting-selected', {
      category: 'meeting',
      teamId: this.props.team.id
    }));

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
    const { meetingGroup, userId, members, todos, events, getEvents } = this.props;
    const memberId = meetingGroup.memberships.find(membership => membership.user_id !== userId).user_id;
    const member = members.find(member => member.id === memberId);

    const stateObj = { member };

    if (!events.length) {
      getEvents();
    }

    todos.forEach(todo => {
      stateObj[`todo-isdone-${todo.id}`] = todo.is_done;
      stateObj[`todo-text-${todo.id}`] = todo.text;
    });

    this.setState(stateObj);
  };

  render = () => {
    const { team, meetings, meetingGroup, imageUrl, history, todos, createTodo, updateTodo, deleteTodo } = this.props;
    const { member, newMeetingDateTime, newMeetingDateTimeError, isScheduleMeetingSelected, event } = this.state;
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
    } = team;
    const canCreateNewMeeting = meetings.length < 1 || (meetings.length > 0 && meetings[0].is_done);
    const todoStates = _.pick(this.state, Object.keys(this.state).filter(key => /todo/.test(key)));
    const finishedMeetings = meetings.filter(meeting => meeting.is_done);

    return (
      <div>
        <Helmet title={`Meetings with ${member.given_name} ${member.family_name} | Good Chat`} />
        {isScheduleMeetingSelected &&
        <Modal
          closeFunc={this.toggleScheduleMeetingSelected}
        >
          <TeamMemberDetailSchedule
            closeFunc={this.toggleScheduleMeetingSelected}
            guest={member}
            teamId={team.id}
            meetingGroupId={this.props.params.meetingGroupId}
            onScheduleSubmit={this.onScheduleSubmit}
            currentMeeting={!canCreateNewMeeting ? meetings[0] : null}
          />
        </Modal>}
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
                    <fieldset className="align-right">
                      <ul className="stacked-to-inline-list">
                        <li>
                          <button
                            type="button"
                            className="btn-primary-inverse btn-block"
                            onClick={this.toggleScheduleMeetingSelected}
                            disabled={this.state.isStartNowInFlight}
                          >
                            Schedule meeting
                          </button>
                        </li><li>
                          <button
                            id="btn-start-meeting-now"
                            type="button"
                            className="btn-primary btn-block"
                            onClick={this.onStartMeetingNow}
                            disabled={this.state.isStartNowInFlight}
                            autoFocus
                          >
                            {this.state.isStartNowInFlight ? <span>Creating meeting&hellip;</span> : 'Start meeting now'}
                          </button>
                        </li>
                      </ul>
                    </fieldset>
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
                      openScheduler={this.toggleScheduleMeetingSelected}
                    />
                  </li>
                </ul>}
              </section>
              {finishedMeetings.length > 0 && <h3 className="meeting-subhead">Previous meetings</h3>}
              {finishedMeetings.map(meeting => (
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
    todos: _.orderBy(state.meeting.todos, 'created_at'),
    events: state.calendar.events
  }),
  {
    getMeetings,
    updateTeamMembers,
    createMeeting,
    createTodo,
    updateTodo,
    deleteTodo,
    getEvents,
    createEvent,
    updateMeeting
  }
)(TeamMemberDetail);
