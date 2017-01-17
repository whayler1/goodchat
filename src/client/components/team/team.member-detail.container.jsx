import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import TeamMemberDetailMeeting from './team.member-detail.meeting.container.jsx';
import questionDefaults from '../../questions/questions.js';

class TeamMemberDetail extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    meetings: PropTypes.array.isRequired,
    members: PropTypes.array,
    member: PropTypes.object
  };
  state = {
    member: this.props.members.find(member => member.id === this.props.params.memberId)
  }
  render = () => {
    const { team, meetings } = this.props;
    const { member } = this.state;
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
    } = team;

    const canCreateNewMeeting = meetings.length < 1 || (meetings.length > 0 && meetings[0].is_done);

    console.log('team member detail\nteam:', team, '\nmeetings:', meetings);
    console.log('state:', this.state);

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
          <h3>Meetings</h3>
          <TeamMemberDetailMeeting
            question1={question1 || questionDefaults[0][0]}
            question2={question2 || questionDefaults[1][0]}
            question3={question3 || questionDefaults[2][0]}
            question4={question4 || questionDefaults[3][0]}
            question5={question5 || questionDefaults[4][0]}
          />
          {canCreateNewMeeting &&
          <button
            type="button"
            className="btn-primary-inverse btn-block"
          >
            Create New Meeting <i className="material-icons">note_add</i>
          </button>
          }
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team,
    meetings: state.meeting.meetings,
    members: state.team.members
  })
)(TeamMemberDetail);
