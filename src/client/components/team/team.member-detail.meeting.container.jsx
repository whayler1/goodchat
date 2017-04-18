import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import moment from 'moment';
import superagent from 'superagent';
import TextareaAutosize from 'react-textarea-autosize';
import Dropdown from '../dropdown/dropdown.component.jsx';
import AutosizeInput from 'react-input-autosize';

import { updateMeeting, completeMeeting, getMeetings, deleteMeeting } from '../meeting/meeting.dux.js';
import { updateTeamMembers } from '../team/team.dux.js';
import { setRedirect } from '../login/login.dux.js';

const getStringAsHtml = str => {
  const splitStr = str.split(/\r|\n/g);

  return splitStr.map((split, index) => {
      if (index > 0) {
        return [
          <br/>,
          split
        ];
      } else {
        return split;
      }
    });
}

function QuestionAnswer({
  index,
  question,
  answer,
  onChange,
  onDeleteQA,
  isUser,
  isHost,
  isDone,
  hostImageUrl,
  userImageUrl,
  qaLength
}) {
  return (
    <div className="clearfix">
      <div className="team-member-detail-qa-list-item-input-group">
        <div className="team-member-detail-qa-list-item-icon"
          style={{backgroundImage: `url(${hostImageUrl})`}}
        ></div>
        {(isHost && !isDone) &&
        <div className="team-member-detail-qa-list-item-input-wrap">
          <TextareaAutosize
            id={`question${index}`}
            name={`question${index}`}
            className={`form-control${ (!isHost || isDone) ? ' form-control-cosmetic' : '' }`}
            maxLength={5000}
            value={question}
            onChange={onChange}
            autoFocus={index < 2}
            placeholder="Ask a question"
          />
        </div>}
        {(!isHost || isDone) && <p id={`question${index}`} className={question ? '' : 'team-member-detail-qa-list-item-no-comment'}>{ question ? getStringAsHtml(question) : <i className="material-icons">more_horiz</i>}</p>}
      </div>
      <div className="team-member-detail-qa-list-item-input-group">
        <div className="team-member-detail-qa-list-item-icon"
          style={{backgroundImage: `url(${userImageUrl})`}}
        ></div>
        {(isUser && !isDone) &&
        <div className="team-member-detail-qa-list-item-input-wrap">
          <TextareaAutosize
            id={`answer${index}`}
            name={`answer${index}`}
            className={`form-control${ (!isUser || isDone) ? ' form-control-cosmetic' : ''}`}
            maxLength={5000}
            value={answer}
            onChange={onChange}
            autoFocus={index < 2}
            placeholder="Click here to answer"
          />
        </div>}
        {(!isUser || isDone) && <p id={`answer${index}`} className={answer ? '' : 'team-member-detail-qa-list-item-no-comment'}>{ answer ? getStringAsHtml(answer) : <i className="material-icons">more_horiz</i>}</p>}
      </div>
      {isHost && !isDone && (qaLength > 1 || typeof qaLength !== 'number') &&
      <ul className="pull-right inline-list meeting-qa-foot">
        <li>
          <button
            className="btn-no-style"
            type="button"
            onClick={() => onDeleteQA(index)}
          >
            Delete <i className="material-icons">close</i>
          </button>
        </li>
      </ul>}
    </div>
  );
}

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
    history: PropTypes.object.isRequired,
    className: PropTypes.string
  }

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
    title: this.props.meeting.title || ''
  }

  onCompleteMeeting = () => this.props.completeMeeting(this.props.meeting.id)
    .then(
      () => {
        Promise.all([
          this.props.getMeetings(this.props.teamId, this.props.memberId),
          this.props.updateTeamMembers(this.props.teamId)
        ]).then(() => this.props.history.push(`/teams/${this.props.teamId}`))
      },
      (err) => {
        if (err.status === 401) {
          // make user login
        }
        console.log('completeMeeting err', err);
      }
    );

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

    this.props.updateMeeting(this.props.meeting.id, sendObj).then(
      res => this.setState({ isUpdateInFlight: false, isUpdateError: false })
    ).catch(err => {
      this.setState({ isUpdateError: true })
      if (err.status === 401) {
        this.props.setRedirect(`/teams/${this.props.teamId}/members/${this.props.memberId}`);
        this.props.history.push('/');
      }
    });
  }, 750)

  onSubmit = e => {
    e.preventDefault();
    this.setState({ isUpdateInFlight: true });
    this.submit();
    return false;
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value, isUpdateInFlight: true }, this.submit);

  noteSubmit = _.debounce(() => {
    superagent.put(`note/${this.props.meeting.note_id}`)
    .send({
      note: this.state.note
    })
    .end((err, res) => {
      if (err) {
        console.log('error updating note', res);
        this.setState({ isNoteUpdateError: true });
        return;
      }
      this.setState({ isNoteUpdateInFlight: false, isNoteUpdateError: false });
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
      analytics.track('delete-meeting', {
        category: 'meeting',
        meetingId: this.props.meeting.id,
        teamId: this.props.teamId
      })
    }
  }

  onAnswersReady = () => this.setState({ isAnswerReadyInFlight: true }, () => {
    if (this.isEverythingAnswered()) {
      this.setState({ answerReadyError: '' }, () =>
        this.props.updateMeeting(this.props.meeting.id, { are_answers_ready: true }).then(() =>
          analytics.track('answers-ready', {
            category: 'meeting',
            meetingId: this.props.meeting.id,
            teamId: this.props.teamId
          })));
    } else  {
      this.setState({ answerReadyError: 'everything-not-answered', isAnswerReadyInFlight: false });
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
    .then(res => this.setState({ isAddQAInFlight: false })));

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

  render = () => {
    const { meeting, imageUrl, memberImageUrl, className } = this.props;
    const { meeting_date, is_done, finished_at, are_answers_ready, qa_length, title } = meeting;
    const { answer1, answer2, answer3, answer4, answer5, isAnswerReadyInFlight,
      isUpdateInFlight, isNoteUpdateInFlight, isAddQAInFlight, isUpdateError,
      isNoteUpdateError, answerReadyError } = this.state;

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
            <span className="meeting-header-date">{ moment(finished_at || meeting_date).format('MMM Do YYYY, h:mm a') }</span>
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
            <span className="meeting-header-date">{ moment(meeting_date).format('MMM Do YYYY, h:mm a') }</span>
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
        <button
          id="btn-answers-ready"
          type="button"
          className="btn-primary-inverse btn-block gutter-large-top"
          onClick={this.onAnswersReady}
          disabled={isAnswerReadyInFlight}
        >
          My answers are ready
        </button>}
        {answerReadyError === 'everything-not-answered' && <div className="danger-text half-gutter-top">Please answer every question</div>}
        <form className="form gutter-large-top"
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
          <TextareaAutosize
            className="form-control"
            id="note"
            name="note"
            rows={3}
            maxLength={5000}
            placeholder="Write your private meeting notes here. Only you can see these."
            onChange={this.onNoteChange}
            value={this.state.note}
          />
        </form>
        {isHost && !is_done &&
        <button
          type="button"
          className="btn-primary btn-block gutter-large-top"
          onClick={this.onCompleteMeeting}
        >
          Complete meeting
        </button>}
      </section>
    );
  }
}

export default connect (
  state => ({
    userId: state.user.id,
    teamId: state.team.team.id
  }),
  {
    updateMeeting,
    completeMeeting,
    getMeetings,
    updateTeamMembers,
    deleteMeeting,
    setRedirect
  }
)(TeamMemberDetailMeeting);
