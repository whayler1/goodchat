import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class User extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    familyName: PropTypes.string,
    givenName: PropTypes.string,
    imageUrl: PropTypes.string,
  }
  render() {
    const { email, familyName, givenName, imageUrl } = this.props;
    const fullName = givenName + ' ' + familyName;
    return (
      <main role="main">
        <header className="page-header">
          <h1>My Profile</h1>
        </header>
        <div className="page-body">
          {imageUrl &&
          <div className="user-hero-img-container"
            style={{backgroundImage: `url(${imageUrl})`}}></div>}
          <div className="user-profile-container">
            <div>{fullName}</div>
            <div>{email}</div>
          </div>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({
    email: state.user.email,
    familyName: state.user.familyName,
    givenName: state.user.givenName,
    imageUrl: state.user.imageUrl
  })
)(User);
