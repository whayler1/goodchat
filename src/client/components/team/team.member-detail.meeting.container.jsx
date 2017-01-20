import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import _ from 'underscore';
import moment from 'moment';

function QuestionAnswer({
  question,
  answer
}) {
  return (
    <div>
      <p><b>Q:</b> {question}</p>
      {answer &&
      <p><b>A:</b> {answer}</p>}
    </div>
  );
}

class TeamMemberDetailMeeting extends Component {
  static propTypes = {
    meeting: PropTypes.object.isRequired
  }
  render = () => {
    const { meeting } = this.props;
    const { meeting_date, is_done } = meeting;
    return (
      <div>
        {!is_done && <p>
          <i className="material-icons">date_range</i> <b>{ moment(meeting_date).format('MMM Do YYYY, h:mm a') }</b>
        </p>}
        <ul className="team-member-detail-qa-list">
          {_(5).times(n => (
            <li key={n}>
              <QuestionAnswer
                question={meeting[`question${n + 1}`]}
                answer={meeting[`answer${n + 1}`]}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect ()(TeamMemberDetailMeeting);
