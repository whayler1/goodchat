import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import CalendarAvailableTimes from '../calendar/calendar.available-times.container.jsx';

class TeamMemberDetailSchedule extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired
  };

  render() {
    console.log('%c events', 'background:pink', this.props.events);
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
          <CalendarAvailableTimes
            startTime={moment()}
            endTime={moment({ hour: 18 })}
          />
          <CalendarAvailableTimes
            startTime={moment({ hour: 8 }).add(1, 'day')}
            endTime={moment({ hour: 18 }).add(1, 'day')}
          />
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
