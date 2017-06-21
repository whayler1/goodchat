import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import CalendarAvailableTimes from '../calendar/calendar.available-times.container.jsx';

class TeamMemberDetailSchedule extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired
  };

  componentWillMount() {
    const now = moment();
    const EODHr = 19;
    const isNowBeforeEOD = now.hours() < EODHr;
    const startTime = isNowBeforeEOD ? now : moment({ hour: 6 }).add(1, 'day');
    const endTime = isNowBeforeEOD ? moment({ hour: EODHr }) : moment({ hour: EODHr }).add(1, 'day');

    this.setState({
      startTime,
      endTime
    });
  }

  render() {
    // console.log('%c events', 'background:pink', this.props.events);
    const { events } = this.props;
    const { startTime, endTime } = this.state;

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
            startTime={startTime}
            endTime={endTime}
            events={events}
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
