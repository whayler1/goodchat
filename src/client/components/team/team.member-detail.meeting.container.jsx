import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import moment from 'moment';
import superagent from 'superagent';
import TextareaAutosize from 'react-textarea-autosize';

import { updateMeeting } from '../meeting/meeting.dux.js';

function QuestionAnswer({
  index,
  question,
  answer,
  onChange,
  isUser,
  isHost,
  isDone
}) {
  return (
    <div>
      <div className="team-member-detail-qa-list-item-input-group">
        <b className="team-member-detail-qa-list-item-icon">Q:</b>
        <TextareaAutosize
          id={`question${index}`}
          name={`question${index}`}
          className={`form-control${ (!isHost || isDone) ? ' form-control-cosmetic' : '' }`}
          maxLength={300}
          readOnly={!isHost || isDone}
          value={question}
          onChange={onChange}
        />
      </div>
      <div className="team-member-detail-qa-list-item-input-group">
        <b className="team-member-detail-qa-list-item-icon">A:</b>
        <TextareaAutosize
          id={`answer${index}`}
          name={`answer${index}`}
          className={`form-control${ (!isUser || isDone) ? ' form-control-cosmetic' : ''}`}
          maxLength={300}
          readOnly={!isUser || isDone}
          value={answer}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

class TeamMemberDetailMeeting extends Component {
  static propTypes = {
    meeting: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    updateMeeting: PropTypes.func.isRequired
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

  onCompleteMeeting = () => superagent.put(`meeting/${this.props.meeting.id}`)
    .send({ is_done: true })
    .end((err, res) => {
      if (err) {
        console.log('err finishing meeting', res);
        return;
      }
      console.log('meeting is done!', res);
      this.props.updateMeeting(res.body.meeting);
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
        'question5'
      ));
    }

    superagent.put(`meeting/${this.props.meeting.id}`)
    .send(sendObj)
    .end((err, res) => {
      if (err) {
        console.log('error putting to meeting', res);
        return;
      }
      console.log('success putting meeting!', res.body.meeting);
      this.props.updateMeeting(res.body.meeting);
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
    console.log('onNoteSubmit');
    this.noteSubmit();
    return false;
  }

  onNoteChange = e => this.setState({ [e.target.name]: e.target.value }, this.noteSubmit)

  render = () => {
    const { meeting } = this.props;
    const { meeting_date, is_done } = meeting;

    const isUser = this.props.meeting.user_id === this.props.userId;
    const isHost = this.props.meeting.host_id === this.props.userId;

    return (
      <div>
        <p>
          <i className="material-icons">date_range</i> <b>{ moment(meeting_date).format('MMM Do YYYY, h:mm a') }</b>
        </p>
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
                />
              </li>
            ))}
          </ul>
        </form>
        <form className="form"
          onSubmit={this.onNoteSubmit}
        >
          <label htmlFor="note" className="input-label">Notes</label>
          <TextareaAutosize
            className="form-control"
            id="note"
            name="note"
            placeholder="Write your private meeting notes here"
            onChange={this.onNoteChange}
            value={this.state.note}
          />
        </form>
        {isHost && !is_done &&
        <button
          type="button"
          className="btn-secondary btn-block"
          onClick={this.onCompleteMeeting}
        >
          Complete meeting
        </button>}
      </div>
    );
  }
}

export default connect (
  state => ({
      userId: state.user.id
  }),
  {
    updateMeeting
  }
)(TeamMemberDetailMeeting);
