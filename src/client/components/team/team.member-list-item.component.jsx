import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function TeamMemberListItem({
  givenName,
  familyName,
  email,
  picture,
  id,
  teamId
}) {
  return (
    <Link to={`teams/${teamId}/members/${id}`}>
      <div className="team-member-ui-image"
        style={{backgroundImage: `url(${picture})`}}
      ></div>
      <div className="team-member-ui-content">
        <div>{givenName} {familyName}</div>
        <div>{email}</div>
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
