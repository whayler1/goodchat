import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import CalendarAvailableTimes from '../calendar/calendar.available-times.container.jsx';
import TeamMemberDetailScheduleTimeSlot from './team.member-detail.schedule-timeslot.component.jsx';

import { createEvent } from '../calendar/calendar.dux.js';

class TeamMemberDetailSchedule extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired,
    createEvent: PropTypes.func.isRequired,
    onScheduleSubmit: PropTypes.func.isRequired,
    guest: PropTypes.object.isRequired,
    givenName: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired
  };

  state = {
    selectedTimeSlot: null
  };

  StartHr = 6;

  EODHr = 19;

  getLabel = momentObj => momentObj.format('ddd MMM DD, YYYY');

  getIsPrevVisible = momentObj => moment().hours() < this.EODHr ? momentObj.isAfter(moment()) : momentObj.isAfter(moment().add(1, 'day').hours(0).minutes(0));

  getIterateFunc = funcKey => () => {
    const startTime = this.state.startTime.clone().hours(this.StartHr).minutes(0).seconds(0).milliseconds(0)[funcKey](1, 'day');
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

  onTimeSlotSelected = selectedTimeSlot => this.setState({ selectedTimeSlot });

  deselectTimeSlot = () => this.setState({ selectedTimeSlot: null });

  componentWillMount() {
    const now = moment();
    const { EODHr, StartHr } = this;
    const isNowBeforeEOD = now.hours() < EODHr;
    const startTime = isNowBeforeEOD ? now : moment({ hour: StartHr }).add(1, 'day');
    const endTime = isNowBeforeEOD ? moment({ hour: EODHr }) : moment({ hour: EODHr }).add(1, 'day');
    const label = this.getLabel(startTime);
    const isPrevVisible = this.getIsPrevVisible(startTime);

    this.setState({
      startTime,
      endTime,
      label,
      isPrevVisible
    });
  }

  render() {
    const { events, teamId, meetingGroupId, givenName, familyName } = this.props;
    const { startTime, endTime, label, isPrevVisible, selectedTimeSlot } = this.state;

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
        {selectedTimeSlot && <div className="card-padded-content">
          <button
            type="button"
            className="btn-no-style btn-no-style-primary"
            onClick={this.deselectTimeSlot}
          >
            <i className="material-icons">arrow_back</i> Back to date picker
          </button>
          <TeamMemberDetailScheduleTimeSlot
            startTime={selectedTimeSlot}
            createEvent={this.props.createEvent}
            onScheduleSubmit={this.props.onScheduleSubmit}
            guest={this.props.guest}
            givenName={givenName}
            familyName={familyName}
            teamId={teamId}
            meetingGroupId={meetingGroupId}
          />
        </div>}
        {!selectedTimeSlot &&
        <div className="card-padded-content">
          <span className="input-label">Choose an open meeting time</span>
          <div className="available-times-nav">
            {isPrevVisible && <button
              className="btn-no-style btn-no-style-primary available-times-nav-prev-btn"
              onClick={this.onPrevClick}
            >
              <i className="material-icons">chevron_left</i>Prev
            </button>}
            <span className="input-label">{label}</span>
            <button
              className="btn-no-style btn-no-style-primary available-times-nav-next-btn"
              onClick={this.onNextClick}
            >
              Next<i className="material-icons">chevron_right</i>
            </button>
          </div>
          <CalendarAvailableTimes
            startTime={startTime}
            endTime={endTime}
            events={events}
            onTimeSlotSelected={this.onTimeSlotSelected}
          />
        </div>
        }
      </section>
    );
  }
}

export default connect(
  state => ({
    events: state.calendar.events,
    givenName: state.user.givenName,
    familyName: state.user.familyName
  }),
  {
    createEvent
  }
)(TeamMemberDetailSchedule);
