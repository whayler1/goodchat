import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

export default function TeamMemberListItem({
  givenName,
  familyName,
  email,
  picture,
  meetingGroupId,
  teamId,
  nextMeetingDate
}) {
  return (
    <Link to={`teams/${teamId}/members/${meetingGroupId}`}>
      <div className="team-member-ui-image"
        style={{backgroundImage: `url(${picture})`}}
      ></div>
      <div className="team-member-ui-content">
        <div className="team-member-ui-content-name">{givenName} {familyName}</div>
        <div>{email}</div>
        <div className="team-member-ui-content-info">
          {(() => {
            if (nextMeetingDate) {
              const now = moment();
              const nextMeetingDateMoment = moment(nextMeetingDate);

              if (nextMeetingDateMoment.isAfter(now)) {
                return <span>{nextMeetingDateMoment.fromNow(true)} <i className="material-icons">alarm</i></span>;
              }
              if (nextMeetingDateMoment.isBefore(now) && now.diff(nextMeetingDateMoment, 'h') > 2) {
                return <span className="danger-text">{nextMeetingDateMoment.fromNow()} <i className="material-icons">alarm_off</i></span>;
              }
              return <span className="success-text">Now <i className="material-icons">alarm_on</i></span>;
            } else {
              return <span>Shedule <i className="material-icons">alarm_add</i></span>;
            }
          })()}
        </div>
      </div>
    </Link>
  );
}

TeamMemberListItem.propTypes = {
  givenName: PropTypes.string.isRequired,
  familyName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  picture: PropTypes.string,
  meetingGroupId: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired
};
