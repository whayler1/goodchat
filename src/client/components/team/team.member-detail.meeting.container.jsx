import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import moment from 'moment';
import superagent from 'superagent';
import TextareaAutosize from 'react-textarea-autosize';
import Dropdown from '../dropdown/dropdown.component.jsx';

import { updateMeeting, completeMeeting, getMeetings, deleteMeeting } from '../meeting/meeting.dux.js';
import { updateTeamMembers } from '../team/team.dux.js';
import { setRedirect } from '../login/login.dux.js';

function QuestionAnswer({
  index,
  question,
  answer,
  onChange,
  isUser,
  isHost,
  isDone,
  hostImageUrl,
  userImageUrl
}) {
  return (
    <div>
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
            maxLength={300}
            value={question}
            onChange={onChange}
            autoFocus={index < 2}
            placeholder="Ask a question"
          />
        </div>}
        {(!isHost || isDone) && <p className={question ? '' : 'team-member-detail-qa-list-item-no-comment'}>{ question ? question : <i className="material-icons">more_horiz</i>}</p>}
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
            maxLength={300}
            value={answer}
            onChange={onChange}
            autoFocus={index < 2}
            placeholder="Click here to answer"
          />
        </div>}
        {(!isUser || isDone) && <p className={answer ? '' : 'team-member-detail-qa-list-item-no-comment'}>{ answer ? answer : <i className="material-icons">more_horiz</i>}</p>}
      </div>
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
    isAnswerReadyInFlight: false
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
        'question5'
      ));
    }

    this.props.updateMeeting(this.props.meeting.id, sendObj).catch(err => {
      if (err.status === 401) {
        this.props.setRedirect(`/teams/${this.props.teamId}/members/${this.props.memberId}`);
        this.props.history.push('/');
      }
    });
  }, 750)

  onSubmit = e => {
    e.preventDefault();
    console.log('onSubmit');
    this.submit();
    return false;
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value }, this.submit);

  noteSubmit = _.debounce(() => {
    console.log('note submit', this.state.note, '\nthis.props.meeting.note_id', this.props.meeting.note_id);
    superagent.put(`note/${this.props.meeting.note_id}`)
    .send({
      note: this.state.note
    })
    .end((err, res) => {
      if (err) {
        console.log('error updating note', res);
        return;
      }
      console.log('notes updated', res);
    });
  }, 750);

  onNoteSubmit = e => {
    if (e) {
      e.preventDefault();
    }
    this.noteSubmit();
    return false;
  }

  onNoteChange = e => this.setState({ [e.target.name]: e.target.value }, this.noteSubmit)

  onDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete this meeting? This can not be undone.`)) {
      this.props.deleteMeeting(this.props.meeting.id).then(() => this.props.updateTeamMembers(this.props.teamId));
    }
  }

  onAnswersReady = () => this.setState({ isAnswerReadyInFlight: true }, () =>
    this.props.updateMeeting(this.props.meeting.id, { are_answers_ready: true }));

  render = () => {
    const { meeting, imageUrl, memberImageUrl, className } = this.props;
    const { meeting_date, is_done, finished_at, are_answers_ready } = meeting;
    const { answer1, answer2, answer3, answer4, answer5, isAnswerReadyInFlight } = this.state;

    const isUser = this.props.meeting.user_id === this.props.userId;
    const isHost = this.props.meeting.host_id === this.props.userId;

    const hostImageUrl = isHost ? imageUrl : memberImageUrl;
    const userImageUrl = isHost ? memberImageUrl : imageUrl;

    const isEverythingAnswered = [
      answer1,
      answer2,
      answer3,
      answer4,
      answer5
    ].every(answer => answer && answer.length > 0)

    return (
      <section className={className ? className : ''}>

        {is_done &&
        <div className="meeting-header meeting-header-finished">
          <i className="material-icons meeting-header-lg-icon">date_range</i>
          {finished_at &&
          <div className="meeting-header-lg-content">
            <h1 className="meeting-header-title">Finished { moment(finished_at).fromNow() }</h1>
            <span className="meeting-header-date">{ moment(finished_at).format('MMM Do YYYY, h:mm a') }</span>
          </div>
          }
          {!finished_at &&
          <div className="meeting-header-lg-content">
            <h1 className="meeting-header-title">Finished { moment(meeting_date).fromNow() }</h1>
            <span className="meeting-header-date">{ moment(meeting_date).format('MMM Do YYYY, h:mm a') }</span>
          </div>
          }
        </div>}
        {!is_done &&
        <div className="meeting-header">
          <i className="material-icons meeting-header-lg-icon">date_range</i>
          <div className="meeting-header-lg-content">
            <h1 className="meeting-header-title">Current meeting</h1>
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
          if (!is_done && !isHost) {
            if (isEverythingAnswered) {
              return <p>Feel free to update your answers at any time.</p>
            }
            return <p>Answer these questions before the meeting begins to get a head start!</p>
          } else if (!is_done && isHost) {
            return <p>You can update your questions at any time.</p>
          }
        })()}
        <form
          className="form"
          onSubmit={this.onSubmit}
        >
          <ul className="team-member-detail-qa-list">
            {_(5).times(n => (
              <li key={n}>
                <QuestionAnswer
                  index={n + 1}
                  question={this.state[`question${n + 1}`]}
                  answer={this.state[`answer${n + 1}`]}
                  onChange={this.onChange}
                  isUser={isUser}
                  isHost={isHost}
                  isDone={is_done}
                  hostImageUrl={hostImageUrl}
                  userImageUrl={userImageUrl}
                />
              </li>
            ))}
          </ul>
        </form>
        {!isHost && !is_done && !are_answers_ready &&
        <button
          type="button"
          className="btn-primary-inverse btn-block gutter-large-top"
          onClick={this.onAnswersReady}
          disabled={isAnswerReadyInFlight}
        >
          My answers are ready
        </button>}
        <form className="form gutter-large-top"
          onSubmit={this.onNoteSubmit}
        >
          <label htmlFor="note" className="input-label">Take meeting notes here</label>
          <TextareaAutosize
            className="form-control"
            id="note"
            name="note"
            rows={3}
            maxLength={1500}
            placeholder="Write your private meeting notes here. Only you can see these."
            onChange={this.onNoteChange}
            value={this.state.note}
          />
        </form>
        {isHost && !is_done &&
        <button
          type="button"
          className="btn-primary-inverse btn-block gutter-large-top"
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
