import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import superagent from 'superagent';
import _ from 'lodash';

import { setMeetings } from '../meeting/meeting.dux.js';

import TeamMemberDetailMeeting from './team.member-detail.meeting.container.jsx';
import questionDefaults from '../../questions/questions.js';

class TeamMemberDetail extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    meetings: PropTypes.array.isRequired,
    members: PropTypes.array,
    member: PropTypes.object,
    setMeetings: PropTypes.func.isRequired,
    givenName: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired
  }

  state = {
    member: this.props.members.find(member => member.id === this.props.params.memberId),
    now: moment(),
    newMeetingDateTime: `${moment().add(7, 'd').format('YYYY-MM-DD')}T14:00`,
    newMeetingDateTimeError: ''
  }

  onChange = e => {
    console.log('onChange', e.target.value);
    this.setState({ [e.target.name]: e.target.value });
  }

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

  updateMeetings = () => superagent.get(`team/${this.props.team.id}/meetings/${this.state.member.id}`)
    .end((err, res) => {
      if (err) {
        console.log('err updating meetings', res);
        return;
      }
      console.log('success! updating meetings', res);
      this.props.setMeetings(res.body.meetings);
    });

  submit = () => {
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
      newMeetingDateTime
    } = this.state;

    superagent.post(`team/${this.props.team.id}/meeting/${this.state.member.id}`)
    .send({
      question1: question1 || questionDefaults[0][0],
      question2: question2 || questionDefaults[1][0],
      question3: question3 || questionDefaults[2][0],
      question4: question4 || questionDefaults[3][0],
      question5: question5 || questionDefaults[4][0],
      meeting_date: moment(newMeetingDateTime).toISOString()
    })
    .end((err, res) => {
      if (err) {
        console.log('error creating new meeting', res);
        return;
      }
      console.log('SUCCESS creating new meeting', res);
      this.updateMeetings();
    });
  }

  onSubmit = e => {
    e.preventDefault();

    this.validate().then(
      () => {
        console.log('resolved validated');
        this.submit();
      },
      () => console.log('rejected validation', this.state)
    );

    return false;
  }

  render = () => {
    const { team, meetings } = this.props;
    const { member, newMeetingDateTime, newMeetingDateTimeError } = this.state;
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
    } = team;

    const canCreateNewMeeting = meetings.length < 1 || (meetings.length > 0 && meetings[0].is_done);

    console.log('%c team member detail\nteam:', 'background:aqua', team, '\nmeetings:', meetings);
    // console.log('state:', this.state);

    return (
      <main role="main">
        <header className="page-header">
          <h1>{team.name}</h1>
        </header>
        <div className="page-body">
          <div className="team-member-ui-wrapper">
            <div className="team-member-ui-image"
              style={{backgroundImage: `url(${member.picture})`}}
            ></div>
            <div className="team-member-ui-content">
              <div>{member.given_name} {member.family_name}</div>
              <div>{member.email}</div>
            </div>
          </div>
          {canCreateNewMeeting &&
          <form className="form" onSubmit={this.onSubmit}>
            <fieldset className={newMeetingDateTimeError ? 'input-error' : ''}>
              <label
                htmlFor="newMeetingDateTime"
                className="input-label"
              >New meeting date and time</label>
              <input
                type="datetime-local"
                className="form-control"
                id="newMeetingDateTime"
                name="newMeetingDateTime"
                value={newMeetingDateTime}
                onChange={this.onChange}
              />
              {newMeetingDateTimeError &&
              <p className="input-error-msg">
                {newMeetingDateTimeError === 'doesnt-exist' && 'Please provide a date and time.'}
                {newMeetingDateTimeError === 'before-now' && 'New meeting must be in the future.'}
              </p>
              }
            </fieldset>
            <fieldset>
              <button
                type="submit"
                className="btn-primary-inverse btn-block"
              >
                Create New Meeting <i className="material-icons">note_add</i>
              </button>
            </fieldset>
          </form>
          }
          <h3>Meetings with {this.props.givenName} {this.props.familyName}</h3>
          <ul className="page-body-list">
            {meetings.map(meeting => (
              <li key={meeting.id}>
                <TeamMemberDetailMeeting meeting={meeting}/>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team,
    meetings: state.meeting.meetings,
    members: state.team.members,
    givenName: state.user.givenName,
    familyName: state.user.familyName
  }),
  {
    setMeetings
  }
)(TeamMemberDetail);
