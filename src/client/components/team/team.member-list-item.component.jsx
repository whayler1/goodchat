import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

export default function TeamMemberListItem({
  givenName,
  familyName,
  email,
  picture,
  id,
  teamId,
  nextMeetingDate
}) {
  return (
    <Link to={`teams/${teamId}/members/${id}`}>
      <div className="team-member-ui-image"
        style={{backgroundImage: `url(${picture})`}}
      ></div>
      <div className="team-member-ui-content">
        <div className="team-member-ui-content-name">{givenName} {familyName}</div>
        <div>{email}</div>
        <div className="team-member-ui-content-info">
          {(() => {
            if (nextMeetingDate) {
              console.log('has next meeting');
              return <span>{moment(nextMeetingDate).fromNow(true)} <i className="material-icons">timer</i></span>;
            } else {
              console.log('-- does not has next mtg');
              return <i className="material-icons">timer_off</i>;
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
  id: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired
};
