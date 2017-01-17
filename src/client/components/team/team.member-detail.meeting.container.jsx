import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class TeamMemberDetailMeeting extends Component {
  static propTypes = {
    question1: PropTypes.string.isRequired,
    question2: PropTypes.string.isRequired,
    question3: PropTypes.string.isRequired,
    question4: PropTypes.string.isRequired,
    question5: PropTypes.string.isRequired,
  }
  state = {
    questions: [
      this.props.question1,
      this.props.question2,
      this.props.question3,
      this.props.question4,
      this.props.question5
    ]
  }
  render = () => {
    const { questions } = this.state;
    return (
      <div>
        <ul>
          {questions.map((question, index) =>
          <li key={index}>{question}</li>)}
        </ul>
      </div>
    );
  }
}

export default connect ()(TeamMemberDetailMeeting);
