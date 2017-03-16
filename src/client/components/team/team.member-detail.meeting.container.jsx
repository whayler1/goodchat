import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import moment from 'moment';
import superagent from 'superagent';
import TextareaAutosize from 'react-textarea-autosize';

import { updateMeeting, completeMeeting, getMeetings } from '../meeting/meeting.dux.js';
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
    imageUrl: PropTypes.string.isRequired,
    memberImageUrl: PropTypes.string.isRequired,
    memberId: PropTypes.string.isRequired,
    setRedirect: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
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
    note: this.props.meeting.note
  }

  onCompleteMeeting = () => this.props.completeMeeting(this.props.meeting.id)
    .then(
      () => this.props.getMeetings(this.props.teamId, this.props.memberId),
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

  onChange = e => {
    console.log('on change', e.target);
    this.setState({ [e.target.name]: e.target.value }, this.submit);
  }

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

  render = () => {
    const { meeting, imageUrl, memberImageUrl } = this.props;
    const { meeting_date, is_done, finished_at } = meeting;

    const isUser = this.props.meeting.user_id === this.props.userId;
    const isHost = this.props.meeting.host_id === this.props.userId;

    const hostImageUrl = isHost ? imageUrl : memberImageUrl;
    const userImageUrl = isHost ? memberImageUrl : imageUrl;

    return (
      <section>

        {finished_at &&
        <div className="meeting-header">
          <span className="meeting-header-date"><i className="material-icons">date_range</i> <b>{ moment(finished_at).format('MMM Do YYYY, h:mm a') }</b></span>
        </div>}
        {!finished_at &&
        <div className="meeting-header">
          <i className="material-icons meeting-header-lg-icon">date_range</i>
          <div className="meeting-header-lg-content">
            <h1 className="meeting-header-title">Current meeting</h1>
            <span className="meeting-header-date">{ moment(meeting_date).format('MMM Do YYYY, h:mm a') }</span>
          </div>
        </div>}

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
        {!is_done &&
        <form className="form gutter-large-top"
          onSubmit={this.onNoteSubmit}
        >
          <label htmlFor="note" className="input-label">Notes</label>
          <TextareaAutosize
            className="form-control"
            id="note"
            name="note"
            placeholder="Write your private meeting notes here. Only you can see these."
            onChange={this.onNoteChange}
            value={this.state.note}
          />
        </form>}
        {is_done &&
        <div className="gutter-large-top">
          <div className="input-label">Notes</div>
          <p>{meeting.note}</p>
        </div>
        }
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
    setRedirect
  }
)(TeamMemberDetailMeeting);
