import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import moment from 'moment';
import superagent from 'superagent';
import TextareaAutosize from 'react-textarea-autosize';
import QuestionAnswer from './team.member-detail.meeting.question-answer.container.jsx';
import TeamMemberDetailToDo from './team.member-detail.meeting.todo-item.component.jsx';
import Dropdown from '../dropdown/dropdown.component.jsx';
import AutosizeInput from 'react-input-autosize';
import ReactMarkdown from 'react-markdown';

import { updateMeeting, completeMeeting, getMeetings, deleteMeeting, createTodo,
  updateTodo, deleteTodo, sendMeetingInvite } from '../meeting/meeting.dux.js';
import { updateTeamMembers } from '../team/team.dux.js';
import { setRedirect } from '../login/login.dux.js';
import { logout } from '../user/user.dux.js';
import { updateEvent } from '../calendar/calendar.dux.js';

class TeamMemberDetailMeeting extends Component {
  static propTypes = {
    meeting: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    updateMeeting: PropTypes.func.isRequired,
    completeMeeting: PropTypes.func.isRequired,
    getMeetings: PropTypes.func.isRequired,
    updateTeamMembers: PropTypes.func.isRequired,
    deleteMeeting: PropTypes.func.isRequired,
    imageUrl: PropTypes.string.isRequired,
    memberImageUrl: PropTypes.string.isRequired,
    memberId: PropTypes.string.isRequired,
    setRedirect: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    className: PropTypes.string,
    meetingGroupId: PropTypes.string.isRequired,
    todos: PropTypes.array,
    createTodo: PropTypes.func.isRequired,
    updateTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    sendMeetingInvite: PropTypes.func.isRequired,
    updateEvent: PropTypes.func.isRequired,
    onTodoCheckboxChange: PropTypes.func.isRequired,
    onTodoTextChange: PropTypes.func.isRequired,
    openScheduler: PropTypes.func.isRequired,
    todoStates: PropTypes.object.isRequired,
    events: PropTypes.array.isRequired
  };

  state = {
    question1: this.props.meeting.question1,
    question2: this.props.meeting.question2,
    question3: this.props.meeting.question3,
    question4: this.props.meeting.question4,
    question5: this.props.meeting.question5,
    answer1: this.props.meeting.answer1,
    answer2: this.props.meeting.answer2,
    answer3: this.props.meeting.answer3,
    answer4: this.props.meeting.answer4,
    answer5: this.props.meeting.answer5,
    note: this.props.meeting.note,
    isAnswerReadyInFlight: false,
    isNoteMarkdown: (_.isString(this.props.meeting.note) && this.props.meeting.note.length > 0),
    isNoteAutofocus: false,
    title: this.props.meeting.title || ''
  };

  onCompleteMeeting = () => this.props.completeMeeting(this.props.meeting.id)
    .then(
      () => {
        Promise.all([
          this.props.getMeetings(this.props.teamId, this.props.meetingGroupId),
          this.props.updateTeamMembers(this.props.teamId)
        ]).then(() => this.props.history.push(`/teams/${this.props.teamId}`))
      },
      (err) => {
        if (err.status === 401) {
          // make user login
          this.props.logout();
          this.props.setRedirect(`/teams/${this.props.teamId}/meetings/${this.props.memberId}`);
          this.props.history.push('/');
        }
      }
    );

  inviteAnalyticsObj = {
    category: 'meeting',
    meetingId: this.props.meeting.id,
    teamId: this.props.teamId
  };

  onInviteSuccess = () => this.setState({ isSendInviteInFlight: false, isInviteSent: true },
    () => window.analytics.track('meeting-invite-sent', this.inviteAnalyticsObj));

  onInviteError = () => this.setState({ isSendInviteInFlight: false, isInviteError: true },
    () => window.analytics.track('meeting-invite-error', this.inviteAnalyticsObj));

  sendInvite = () => this.setState({ isSendInviteInFlight: true }, () => {
    const { is_invite_sent, google_calendar_event_id } = this.props.meeting;
    const { onInviteError, onInviteSuccess } = this;

    const isEmailSuppressed = !is_invite_sent && _.isString(google_calendar_event_id);

    this.props.sendMeetingInvite(this.props.teamId, this.props.meetingGroupId, this.props.meeting.id, isEmailSuppressed).then(
      () => {
        if (isEmailSuppressed) {
          const event = this.props.events.find(event => event.id === google_calendar_event_id);
          console.log('%c event', 'background:pink', event);
          const description = `You have a meeting on Good Chat. Follow the link below to fill out your answers before the meeting:
${event.description}`;
          this.props.updateEvent(google_calendar_event_id, { description }, true).then(onInviteSuccess, onInviteError);
        } else {
          onInviteSuccess();
        }
      },
      onInviteError
    );
  });

  submit = _.debounce(() => {
    const isUser = this.props.meeting.user_id === this.props.userId;
    const isHost = this.props.meeting.host_id === this.props.userId;

    const sendObj = {};

    if (isUser) {
      _.assign(sendObj, _.pick(
        this.state,
        'answer1',
        'answer2',
        'answer3',
        'answer4',
        'answer5'
      ));
    } else if (isHost) {
      _.assign(sendObj, _.pick(
        this.state,
        'question1',
        'question2',
        'question3',
        'question4',
        'question5',
        'title'
      ));
    }

    const analyticsObj = {
      ...sendObj,
      category: 'meeting',
      meetingId: this.props.meeting.id,
      teamId: this.props.teamId
    };

    this.props.updateMeeting(this.props.meeting.id, sendObj).then(
      res => this.setState({ isUpdateInFlight: false, isUpdateError: false },
        () => window.analytics.track('update-meeting', analyticsObj))
    ).catch(err => {
      this.setState({ isUpdateError: true }, () => window.analytics.track('update-meeting-error', analyticsObj));
      if (err.status === 401) {
        this.props.logout();
        this.props.setRedirect(`/teams/${this.props.teamId}/meetings/${this.props.memberId}`);
        this.props.history.push('/');
      }
    })
  }, 750);

  onSubmit = e => {
    e.preventDefault();
    this.setState({ isUpdateInFlight: true });
    this.submit();
    return false;
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value, isUpdateInFlight: true }, this.submit);

  noteSubmit = _.debounce(() => {
    const analyticsObj = {
      category: 'meeting',
      meetingId: this.props.meeting.id,
      teamId: this.props.teamId,
      note: this.state.note
    };
    superagent.put(`note/${this.props.meeting.note_id}`)
    .send({
      note: this.state.note
    })
    .end((err, res) => {
      if (err) {
        this.setState({ isNoteUpdateError: true },
          () => window.analytics.track('updated-note-error', analyticsObj));
        return;
      }
      this.setState({ isNoteUpdateInFlight: false, isNoteUpdateError: false },
        () => window.analytics.track('updated-note', analyticsObj));
    });
  }, 750);

  onNoteSubmit = e => {
    if (e) {
      e.preventDefault();
    }
    this.noteSubmit();
    return false;
  }

  onNoteChange = e => this.setState({ [e.target.name]: e.target.value, isNoteUpdateInFlight: true }, this.noteSubmit)

  onTitleChange = e => this.setState({ title: e.target.value }, this.submit)

  setTitleIconVisible = () => this.setState({ isTitleIconVisible: true })
  setTitleIconInvisible = () => this.setState({ isTitleIconVisible: false })

  onDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete this meeting? This can not be undone.`)) {
      this.props.deleteMeeting(this.props.meeting.id).then(() => this.props.updateTeamMembers(this.props.teamId));
      window.analytics.track('delete-meeting', {
        category: 'meeting',
        meetingId: this.props.meeting.id,
        teamId: this.props.teamId
      })
    }
  }

  onAnswersReady = () => this.setState({ isAnswerReadyInFlight: true }, () => {
    const analyticsObj = {
      category: 'meeting',
      meetingId: this.props.meeting.id,
      teamId: this.props.teamId
    };

    if (this.isEverythingAnswered()) {
      this.setState({ answerReadyError: '' }, () =>
        this.props.updateMeeting(this.props.meeting.id, { are_answers_ready: true }).then(() =>
          window.analytics.track('answers-ready', analyticsObj)));
    } else  {
      this.setState({ answerReadyError: 'everything-not-answered', isAnswerReadyInFlight: false },
        () => window.analytics.track('answers-ready-rejected', analyticsObj));
    }
  })

  onDeleteQA = index => {
    let { qa_length } = this.props.meeting;
    if (typeof qa_length === 'number') {
      qa_length--;
    } else {
      qa_length = 4;
    }
    const updateObj = {};

    const qas = [1,2,3,4,5].map(n => ({
      q: this.state[`question${n}`],
      a: this.state[`answer${n}`]
    }));
    qas.splice(index - 1, 1);
    qas.push({
      q: '',
      a: ''
    });
    qas.forEach((obj, i) => Object.assign(updateObj, {
      [`question${i + 1}`]: obj.q,
      [`answer${i + 1}`]: obj.a
    }));

    this.props.updateMeeting(this.props.meeting.id, Object.assign({}, updateObj, { qa_length })).then(
      res => {
        this.setState(updateObj);
      },
      err => console.log('delete note fail', err)
    );
  }

  onAddQAClick = () => this.setState({ isAddQAInFlight: true }, () =>
    this.props.updateMeeting(this.props.meeting.id, { qa_length: this.props.meeting.qa_length + 1 })
    .then(() => this.setState({ isAddQAInFlight: false },
      () => window.analytics.track('add-qa', {
        category: 'meeting',
        meetingId: this.props.meeting.id,
        teamId: this.props.teamId
      }))));

  getLiveMeetingTitle = (isShort) => {
    const meetingDate = moment(this.props.meeting.meeting_date);
    const now = moment();

    if (now.isBefore(meetingDate, 'day')) {
      if (isShort) {
        return 'Upcoming';
      }
      return `Meeting ${meetingDate.fromNow()}`;
    }
    if (now.isAfter(meetingDate.add(2, 'hour'))) {
      if (isShort) {
        return 'Overdue';
      }
      return 'Overdue meeting';
    }
    if (now.isBefore(meetingDate, 'second')) {
      if (isShort) {
        return 'Today';
      }
      return 'Todays meeting';
    }
    if (isShort) {
      return 'Current';
    }
    return 'Current meeting';
  };

  isEverythingAnswered = () =>
    [1,2,3,4,5].map(n => `answer${n}`).every((key, index) =>
      (this.props.meeting.qa_length && index >= this.props.meeting.qa_length) ||
      (this.state[key] && this.state[key].length > 0));

  toggleIsNoteMarkdown = () => this.setState({
    isNoteMarkdown: !this.state.isNoteMarkdown,
    isNoteAutofocus: true
  }, () => window.analytics.track('toggle-is-note-markdown', {
    category: 'meeting',
    meetingId: this.props.meeting.id,
    teamId: this.props.teamId
  }));

  meetingDateFormat = 'MMM Do YYYY, h:mm a';

  getMeetingDateDisplay = () => {
    const { finished_at, meeting_date } = this.props.meeting;
    const { event } = this.state;

    if (event) {
      return moment(finished_at || event.start.dateTime).format(this.meetingDateFormat);
    }
    return moment(finished_at || meeting_date).format(this.meetingDateFormat);
  };

  setEvent = events => this.setState({
    event: events.find(event => event.id === this.props.meeting.google_calendar_event_id)
  }, () => console.log('setEvent', this.state.event));

  componentWillReceiveProps(nextProps) {
    if (_.isString(nextProps.meeting.google_calendar_event_id) && !this.state.event && nextProps.events.length) {
      this.setEvent(nextProps.events);
    }
  }

  componentWillMount() {
    const { meeting, events } = this.props;
    if (_.isString(meeting.google_calendar_event_id)) {
      this.setEvent(events);
    }
  }

  render = () => {
    const { meeting, imageUrl, memberImageUrl, className, teamId, meetingGroupId, todos,
      createTodo, updateTodo, deleteTodo, onTodoTextChange, onTodoCheckboxChange, todoStates } = this.props;
    const { meeting_date, is_done, finished_at, are_answers_ready, qa_length, title, is_invite_sent } = meeting;
    const { answer1, answer2, answer3, answer4, answer5, isAnswerReadyInFlight,
      isUpdateInFlight, isNoteUpdateInFlight, isAddQAInFlight, isUpdateError,
      isNoteUpdateError, answerReadyError, isNoteMarkdown, isNoteAutofocus } = this.state;

    const isUser = this.props.meeting.user_id === this.props.userId;
    const isHost = this.props.meeting.host_id === this.props.userId;

    let isOverdue = false;
    if (!is_done) {
      isOverdue = moment().isAfter(moment(meeting_date).add(2, 'hour'));
    }

    const hostImageUrl = isHost ? imageUrl : memberImageUrl;
    const userImageUrl = isHost ? memberImageUrl : imageUrl;

    return (
      <section className={className ? className : ''}>
        {is_done &&
        <div className="meeting-header meeting-header-finished">
          <div className="meeting-header-lg-icon-wrapper">
            <i className="material-icons meeting-header-lg-icon">date_range</i>
            <div className="meeting-header-lg-icon-sub">Finished</div>
          </div>
          <div className="meeting-header-lg-content">
            <h1 className="meeting-header-title">{ title || `Finished ${moment(finished_at || meeting_date).fromNow()}` }</h1>
            <span className="meeting-header-date">{ this.getMeetingDateDisplay() }</span>
          </div>
        </div>}
        {!is_done &&
        <div className="meeting-header">
          <div className={`meeting-header-lg-icon-wrapper${isOverdue ? ' danger-text' : ''}`}>
            <i className="material-icons meeting-header-lg-icon">date_range</i>
            <div className="meeting-header-lg-icon-sub">{ this.getLiveMeetingTitle(true) }</div>
          </div>
          <div className="meeting-header-lg-content">
            {!is_done && isHost &&
            <form onSubmit={this.onSubmit}>
              <AutosizeInput
                type="text"
                id="title"
                name="title"
                className="meeting-header-title"
                placeholder={this.getLiveMeetingTitle()}
                value={this.state.title}
                onChange={this.onTitleChange}
                autoComplete="off"
                maxLength={25}
              />
              {this.state.title.length < 1 && <label htmlFor="title"><i className="material-icons meeting-header-title-input-icon">create</i></label>}
            </form>}
            {(is_done || !isHost) &&
            <h1 className="meeting-header-title">{ title || this.getLiveMeetingTitle() }</h1>}
            <button
              type="button"
              className="btn-no-style"
              onClick={this.props.openScheduler}
            >
              <span className="meeting-header-date">{ this.getMeetingDateDisplay() }</span>
            </button>
            {isHost &&
              <Dropdown
                className="team-meeting-header-dropdown-wrapper"
                label={<button type="button" className="btn-main-team-more"><i className="material-icons">more_horiz</i></button>}
                content={<ul className="dropdown-list">
                          <li>
                            <button type="button" className="btn-no-style btn-no-style-danger nowrap" onClick={this.onDeleteClick}>
                              Cancel meeting <i className="material-icons">delete</i>
                            </button>
                          </li>
                        </ul>}
                isRightAligned={true}
              />}
          </div>
        </div>}
        {(() => {
          if (!is_done) {
            if (!isHost) {
              if (this.isEverythingAnswered()) {
                return <p>Feel free to update your answers at any time.</p>
              }
              return <p>Answer these questions before the meeting begins to get a head start!</p>
            } else {
              return <p>You can update your questions at any time.</p>
            }
          }
        })()}
        <span className="input-label">
          Questions &amp; Answers
          {(() => {
            if (isUpdateError) {
              return <span className="danger-text-text">Error saving your changes.<br/>If the problem persists please contact <a href="mailto:support@goodchat.io">support@goodchat.io</a>.</span>
            } else if (typeof isUpdateInFlight === 'boolean') {
              if (isUpdateInFlight) {
                return <span className="muted-text">&nbsp;&nbsp;Saving...</span>
              } else {
                return <span className="muted-text">&nbsp;&nbsp;Saved</span>
              }
            }
          })()}
        </span>
        <form
          className="form"
          onSubmit={this.onSubmit}
        >
          <ul className="team-member-detail-qa-list">
            {_(qa_length || 5).times(n => (
              <li key={n} className={(!isHost && n > 0) ? 'gutter-top' : ''}>
                <QuestionAnswer
                  index={n + 1}
                  question={this.state[`question${n + 1}`]}
                  answer={this.state[`answer${n + 1}`]}
                  onChange={this.onChange}
                  onDeleteQA={this.onDeleteQA}
                  isUser={isUser}
                  isHost={isHost}
                  isDone={is_done}
                  hostImageUrl={hostImageUrl}
                  userImageUrl={userImageUrl}
                  qaLength={qa_length}
                />
              </li>
            ))}
          </ul>
        </form>
        {isHost && !is_done && qa_length && qa_length < 5 &&
        <div className="align-right">
          <button
            type="button"
            className="btn-no-style team-member-detail-add-qa-btn"
            onClick={this.onAddQAClick}
            disabled={isAddQAInFlight}
          >
            Add question <i className="material-icons">add_circle_outline</i>
          </button>
        </div>}
        {!isHost && !is_done && !are_answers_ready &&
        <div className="gutter-large-top align-right">
          <ul className="stacked-to-inline-list">
            <li>
              <button
                id="btn-answers-ready"
                type="button"
                className="btn-primary-inverse"
                onClick={this.onAnswersReady}
                disabled={isAnswerReadyInFlight}
              >
                My answers are ready
              </button>
            </li>
          </ul>
          {answerReadyError === 'everything-not-answered' && <div className="danger-text half-gutter-top">Please answer every question</div>}
        </div>
        }
        <div className="gutter-large-top">
          <span className="input-label">To-do's</span>
          <ul className="team-member-todo-list">
            {todos && todos.map(todo => (
              <li key={todo.id}>
                <TeamMemberDetailToDo
                  id={todo.id}
                  idPrefix={'card-'}
                  isDone={todoStates[`todo-isdone-${todo.id}`]}
                  teamId={todo.team_id}
                  meetingId={meeting.id}
                  meetingGroupId={meetingGroupId}
                  text={todoStates[`todo-text-${todo.id}`]}
                  createTodo={createTodo}
                  deleteTodo={deleteTodo}
                  onTextChange={onTodoTextChange}
                  onCheckboxChange={onTodoCheckboxChange}
                />
              </li>
            ))}
            <li>
              <TeamMemberDetailToDo
                idPrefix={'card-'}
                teamId={teamId}
                meetingId={meeting.id}
                meetingGroupId={meetingGroupId}
                createTodo={createTodo}
                deleteTodo={deleteTodo}
                onTextChange={onTodoTextChange}
                onCheckboxChange={onTodoCheckboxChange}
              />
            </li>
          </ul>
        </div>
        <form
          className="form gutter-large-top"
          onSubmit={this.onNoteSubmit}
        >
          <label htmlFor="note" className="input-label">
            Meeting notes
            {(() => {
              if (isNoteUpdateError) {
                return <span className="danger-text">Error saving your note.<br/>If the problem persists please contact <a href="mailto:support@goodchat.io">support@goodchat.io</a>.</span>
              } else if (typeof isNoteUpdateInFlight === 'boolean') {
                if (isNoteUpdateInFlight) {
                  return <span className="muted-text">&nbsp;&nbsp;Saving...</span>
                } else {
                  return <span className="muted-text">&nbsp;&nbsp;Saved</span>
                }
              }
            })()}
          </label>
          {(() => {
            if (isNoteMarkdown) {
              return <ReactMarkdown
                className="team-markdown team-markdown-note half-gutter-top"
                source={this.state.note}
                containerProps={{ id: `note-${meeting.id}`, onClick: this.toggleIsNoteMarkdown }}
                escapeHtml={true}
              />;
            } else {
              return <TextareaAutosize
                className="form-control"
                id={`note-${meeting.id}`}
                name="note"
                rows={3}
                maxLength={5000}
                placeholder="Write your private meeting notes here. Only you can see these."
                onChange={this.onNoteChange}
                onBlur={_.isString(this.state.note) && this.state.note.length && this.toggleIsNoteMarkdown}
                autoFocus={isNoteAutofocus}
                value={this.state.note}
              />;
            }
          })()}
        </form>
        {isHost && !is_done &&
        <div className="gutter-large-top align-right">
          {this.state.isInviteError && <p className="danger-text">There was an error sending your meeting reminder. If the problem presists please email <a href="mailto:support@goodchat.io">support@goodchat.io</a>.</p>}
          <ul className="stacked-to-inline-list">
            <li>
              {!this.state.isInviteSent && <button
                type="button"
                className="btn-primary-inverse"
                onClick={this.sendInvite}
                disabled={this.state.isSendInviteInFlight}
                id="btn-send-meeting-invite"
              >
                {this.state.isSendInviteInFlight ? <span>Sending&hellip;</span> : is_invite_sent ? <span>Send reminder</span> : <span>Send invite</span>}
              </button>}
              {this.state.isInviteSent && <p className="success-text center" id="btn-send-meeting-reminder-success">Invite sent</p>}
            </li>
            <li>
              <button
                type="button"
                className="btn-primary"
                id="btn-complete-meeting"
                onClick={this.onCompleteMeeting}
              >
                Complete meeting
              </button>
            </li>
          </ul>
        </div>
        }
      </section>
    );
  }
}

export default connect (
  state => ({
    userId: state.user.id,
    teamId: state.team.team.id,
    meetingGroupId: state.meeting.meetingGroup.id,
    events: state.calendar.events
  }),
  {
    updateMeeting,
    completeMeeting,
    getMeetings,
    updateTeamMembers,
    deleteMeeting,
    setRedirect,
    logout,
    createTodo,
    updateTodo,
    deleteTodo,
    sendMeetingInvite,
    updateEvent
  }
)(TeamMemberDetailMeeting);
