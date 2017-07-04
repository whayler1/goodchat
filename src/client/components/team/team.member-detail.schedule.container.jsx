import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import CalendarAvailableTimes from '../calendar/calendar.available-times.container.jsx';
import TeamMemberDetailScheduleTimeSlot from './team.member-detail.schedule-timeslot.component.jsx';
import DatePicker from 'react-datepicker';

import '../../../../node_modules/react-datepicker/dist/react-datepicker.css';

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
    selectedTimeSlot: null,
    isAllTimesVisible: false,
    startHr: 6,
    EODHr: 19
  };

  now = moment();

  tomorrow = this.now.clone().add(1, 'day');

  isNowPastEOD = this.now.hours() >= this.state.EODHr;

  getLabel = momentObj => momentObj.format('ddd MMM DD, YYYY');

  getIsPrevVisible = momentObj => momentObj.isAfter(this.now);

  getIterateFunc = funcKey => () => {
    let startTime = this.state.startTime.clone().hours(this.state.startHr).minutes(0).seconds(0).milliseconds(0)[funcKey](1, 'day');
    const isSameDay = startTime.isSame(this.now, 'day');

    if (isSameDay) {
      startTime = moment();
    }

    this.onDateSelected(startTime);
  }

  onPrevClick = this.getIterateFunc('subtract');

  onNextClick = this.getIterateFunc('add');

  onTimeSlotSelected = selectedTimeSlot => this.setState({ selectedTimeSlot });

  deselectTimeSlot = () => this.setState({ selectedTimeSlot: null });

  showDatePicker = () => this.setState({ isDatePickerVisible: true });

  hideDatePicker = () => this.setState({ isDatePickerVisible: false });

  showAllTimes = () => this.setState({
    isAllTimesVisible: true,
    startHr: 0,
    EODHr: 24
  }, () => this.onDateSelected(this.state.startTime));

  showLessTimes = () => this.setState({
    isAllTimesVisible: false,
    startHr: 6,
    EODHr: 19
  }, () => this.onDateSelected(this.state.startTime));

  onDateSelected = date => {
    const isDateToday = date.isSame(this.now, 'day');
    this.setState({
      startTime: isDateToday ? moment() : date.clone().hours(this.state.startHr).minutes(0).seconds(0).milliseconds(0),
      endTime: date.clone().hours(isDateToday && this.isNowPastEOD ? 24 : this.state.EODHr),
      label: this.getLabel(date),
      isPrevVisible: this.getIsPrevVisible(date),
      isDatePickerVisible: false
    });
  };

  componentWillMount() {
    const { now, isNowPastEOD, onDateSelected } = this;
    const startTime = isNowPastEOD ? moment({ hour: this.state.startHr }).add(1, 'day') : now;
    onDateSelected(startTime);
  }

  render() {
    const { events, teamId, meetingGroupId, givenName, familyName } = this.props;
    const { startTime, endTime, label, isPrevVisible, selectedTimeSlot, isDatePickerVisible, isAllTimesVisible } = this.state;

    return (
      <section className="card">
        <header className="card-header">
          <h3>Schedule meeting</h3>
          <div className="card-header-close">
            <button
              type="button"
              className="btn-no-style"
              onClick={this.props.closeFunc}
            >
              <i className="material-icons">close</i>
            </button>
          </div>
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
            {!isDatePickerVisible &&
            <button
              type="button"
              onClick={this.showDatePicker}
              className="btn-no-style btn-no-style-secondary"
            >
              {label}
            </button>}
            {isDatePickerVisible &&
            <DatePicker
              selected={startTime}
              minDate={this.isNowPastEOD ? this.tomorrow : this.now }
              onChange={this.onDateSelected}
              onBlur={this.hideDatePicker}
              placeholderText="MM/DD/YYYY"
              calendarClassName="date-picker-calendar"
              className="form-control date-picker-calendar-form-control"
            />}
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
        {!isAllTimesVisible &&
        <div className="text-center gutter-top">
          <button
            type="button"
            className="btn-no-style btn-no-style-primary"
            onClick={this.showAllTimes}
          >
            Show all times
          </button>
        </div>}
        {isAllTimesVisible &&
        <div className="text-center gutter-top">
          <button
            type="button"
            className="btn-no-style btn-no-style-primary"
            onClick={this.showLessTimes}
          >
            Show less times
          </button>
        </div>}
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
