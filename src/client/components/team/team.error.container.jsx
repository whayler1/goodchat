import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";

class TeamError extends Component {

  render() {
    return (
      <main className="main main-team-set-name" role="main">
        <Helmet title="Team Error"/>
        <p>You are not logged in as a member of this team</p>
      </main>
    );
  }
}

export default connect()(TeamError);
