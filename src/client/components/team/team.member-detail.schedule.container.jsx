import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class TeamMemberDetailSchedule extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired
  };

  render() {
    return (
      <section className="card">
        <header className="card-header">
          <h3>Schedule meeting</h3>
          <button
            type="button"
            className="card-header-close btn-no-style"
            onClick={this.props.closeFunc}
          >
            <i className="material-icons">close</i>
          </button>
        </header>
        <div className="card-padded-content">
          <span className="input-label">Choose an open meeting time</span>
        </div>
      </section>
    );
  }
}

export default connect(
  state => ({
    events: state.calendar.events
  })
)(TeamMemberDetailSchedule);
