import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import CalendarAvailableTimes from '../calendar/calendar.available-times.container.jsx';

class TeamMemberDetailSchedule extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired
  };

  StartHr = 6;

  EODHr = 19;

  getLabel = momentObj => momentObj.format('ddd MMM DD, YYYY');

  getIsPrevVisible = momentObj => momentObj.isAfter(moment());

  getIterateFunc = funcKey => () => {
    const startTime = this.state.startTime.clone().hours(this.StartHr).minutes(0).seconds(0)[funcKey](1, 'day');
    const endTime = startTime.clone().hours(this.EODHr);
    const label = this.getLabel(startTime);
    const isPrevVisible = this.getIsPrevVisible(startTime);

    this.setState({
      startTime,
      endTime,
      label,
      isPrevVisible
    });
  }

  onPrevClick = this.getIterateFunc('subtract');

  onNextClick = this.getIterateFunc('add');

  componentWillMount() {
    const now = moment();
    const EODHr = 19;
    const isNowBeforeEOD = now.hours() < EODHr;
    const startTime = isNowBeforeEOD ? now : moment({ hour: 6 }).add(1, 'day');
    const endTime = isNowBeforeEOD ? moment({ hour: EODHr }) : moment({ hour: EODHr }).add(1, 'day');
    const label = startTime.format('ddd MMM DD, YYYY');
    const isPrevVisible = startTime.isAfter(now);

    this.setState({
      startTime,
      endTime,
      label,
      isPrevVisible
    });
  }

  render() {
    const { events } = this.props;
    const { startTime, endTime, label, isPrevVisible } = this.state;

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
          <div>
            {isPrevVisible && <button
              className="btn-no-style btn-no-style-primary"
              onClick={this.onPrevClick}
            >
              Prev
            </button>}
            <span className="input-label">{label}</span>
            <button
              className="btn-no-style btn-no-style-primary"
              onClick={this.onNextClick}
            >
              Next
            </button>
          </div>
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
