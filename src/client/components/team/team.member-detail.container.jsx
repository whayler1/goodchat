import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import superagent from 'superagent';
import _ from 'lodash';

import { setMeetings } from '../meeting/meeting.dux.js';
import { updateTeamMembers } from '../team/team.dux.js';

import TeamMemberDetailMeeting from './team.member-detail.meeting.container.jsx';
import Modal from '../modal/modal.container.jsx';
import questionDefaults from '../../questions/questions.js';
import TeamHeader from './team.header.container.jsx';
import Helmet from "react-helmet";

class TeamMemberDetail extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    meetings: PropTypes.array.isRequired,
    members: PropTypes.array,
    setMeetings: PropTypes.func.isRequired,
    setMembers: PropTypes.func.isRequired,
    givenName: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired
  }

  state = {
    member: this.props.members.find(member => member.id === this.props.params.memberId),
    now: moment(),
    newMeetingDateTime: `${moment().add(7, 'd').format('YYYY-MM-DD')}T14:00`,
    newMeetingDateTimeError: ''
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
      this.updateMeetings();
      this.props.updateTeamMembers(this.props.team.id);
    });
  }

  onSubmit = e => {
    e.preventDefault();

    this.validate().then(
      () => this.submit(),
      () => console.log('rejected validation', this.state)
    );

    return false;
  }

  modalCloseFunc = () => this.props.history.push(`teams/${this.props.team.id}`)

  render = () => {
    const { team, meetings, imageUrl, history } = this.props;
    const { member, newMeetingDateTime, newMeetingDateTimeError } = this.state;
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
    } = team;
    const canCreateNewMeeting = meetings.length < 1 || (meetings.length > 0 && meetings[0].is_done);

    return (
      <Modal closeFunc={this.modalCloseFunc}>
        <Helmet title={`Meetings with ${member.given_name} ${member.family_name}`} />
        <section className="card">
          <header className="card-header">
            <h3>Meetings with {member.given_name} {member.family_name}</h3>
            <div className="card-header-close">
              <Link to={`teams/${team.id}`}>
                <i className="material-icons">close</i>
              </Link>
            </div>
          </header>
          {canCreateNewMeeting &&
          <div className="team-card-subheader">
            <div className="meeting-header">
              <i className="material-icons meeting-header-lg-icon">note_add</i>
              <div className="meeting-header-lg-content">
                <h1 className="meeting-header-title">Create meeting</h1>
              </div>
            </div>
            <form className="form" onSubmit={this.onSubmit}>
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
                  className="btn-primary btn-block"
                >
                  Create meeting
                </button>
              </fieldset>
            </form>
          </div>
          }
          <ul className="team-card-body-list">
            {meetings.map(meeting => (
              <li key={meeting.id}>
                <TeamMemberDetailMeeting
                  meeting={meeting}
                  imageUrl={imageUrl}
                  memberImageUrl={member.picture}
                  memberId={member.id}
                  history={history}
                />
              </li>
            ))}
          </ul>
          <footer className="card-padded-content">
            <Link to={`teams/${team.id}`} className="btn-secondary btn-block">Close</Link>
          </footer>
        </section>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team,
    meetings: state.meeting.meetings.sort((a, b) => {
      const createdAtA = a.created_at;
      const createdAtB = b.created_at;
      if (createdAtA < createdAtB) {
        return 1;
      }
      if (createdAtA > createdAtB) {
        return -1;
      }
      return 0;
    }),
    members: state.team.members,
    givenName: state.user.givenName,
    familyName: state.user.familyName,
    imageUrl: state.user.imageUrl
  }),
  {
    setMeetings,
    updateTeamMembers
  }
)(TeamMemberDetail);
