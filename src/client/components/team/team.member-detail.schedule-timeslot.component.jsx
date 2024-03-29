import React, { Component, PropTypes } from 'react';
import InputMask from 'react-input-mask';
import calendarHelpers from '../calendar/helpers';
import moment from 'moment';
import momentTz from 'moment-timezone';

export default class TeamMemberDetailScheduleTimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    createEvent: PropTypes.func.isRequired,
    updateEvent: PropTypes.func.isRequired,
    onScheduleSubmit: PropTypes.func.isRequired,
    guest: PropTypes.object.isRequired,
    givenName: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired,
    event: PropTypes.object
  };

  state = {
    shouldSendNotification: false
  }

  isDateInputValid = val => {
    let isValid = true;
    const valSplit = val.split('/');
    const monthNum = Number(valSplit[0]);
    const dayNum = Number(valSplit[1]);
    const yearNum = Number('20' + valSplit[2]);
    const daysInMonth = monthNum && yearNum ? moment(`20${valSplit[2]}-${valSplit[0]}`, 'YYYY-MM').daysInMonth() : 0;
    const { currentYear } = this.state;

    if (val.search('_') > -1 ||
        monthNum > 12 ||
        monthNum < 1 ||
        dayNum > daysInMonth ||
        dayNum < 1 ||
        yearNum < currentYear) {
      isValid = false;
    }

    return isValid;
  }

  isTimeInputValid = val => {
    let isValid = true;
    const valSplit = val.split(':');
    const hourNum = Number(valSplit[0]);
    const minuteNum = Number(valSplit[1].substr(0, 2));

    if (val.search('_') > -1 ||
        hourNum > 12 ||
        hourNum < 1 ||
        minuteNum > 59) {
      isValid = false;
    }

    return isValid;
  }

  validate = () => new Promise((resolve, reject) => {
    let isValid = true;
    const { isDateInputValid, isTimeInputValid } = this;
    const { startDate, startTime, endDate, endTime } = this.state;
    const stateObj = {
      isStartDateInvalid: false,
      isEndDateInvalid: false,
      isStartTimeInvalid: false,
      isEndTimeInvalid: false,
      isEndDateBeforeStart: false,
      isCreateEventError: false
    };

    if (!isDateInputValid(startDate)) {
      stateObj.isStartDateInvalid = true;
      isValid = false;
    } else if (!isDateInputValid(endDate)) {
      stateObj.isEndDateInvalid = true;
      isValid = false;
    } else if (!isTimeInputValid(startTime)) {
      stateObj.isStartTimeInvalid = true;
      isValid = false;
    } else if (!isTimeInputValid(endTime)) {
      stateObj.isEndTimeInvalid = true;
      isValid = false;
    } else if (moment(calendarHelpers.getDateTime(endDate, endTime)).isBefore(moment(calendarHelpers.getDateTime(startDate, startTime)))) {
      stateObj.isEndDateBeforeStart = true;
      isValid = false;
    }

    this.setState(stateObj, () => isValid ? resolve() : reject());
  });

  onSubmit = e => {
    e.preventDefault();

    this.validate().then(() => {
      const { guest, givenName, familyName, teamId, meetingGroupId,
        createEvent, updateEvent, onScheduleSubmit, event } = this.props;
      const { startDate, startTime, endDate, endTime, shouldSendNotification } = this.state;
      const {
        getSummary,
        getDescription,
        getStartDateTime,
        getEndDateTime,
        getTimeZone,
        getOptions
      } = calendarHelpers;

      const summary = getSummary(givenName, familyName, guest.given_name, guest.family_name);
      const description = getDescription(teamId, meetingGroupId);
      const startDateTime = getStartDateTime(startDate, startTime);
      const endDateTime = getEndDateTime(endDate, endTime);
      const timeZone = getTimeZone();
      const options = getOptions(guest.email);

      if (event) {
        const newEvent = Object.assign({}, event, {
          start: {
            dateTime: startDateTime,
            timeZone
          },
          end: {
            dateTime: endDateTime,
            timeZone
          }
        });
        this.setState({ isCreateEventError: false, isInFlight: true }, () =>
          updateEvent(event.id, newEvent, shouldSendNotification).then(
            () => onScheduleSubmit(startDateTime, event.id, shouldSendNotification),
            () => this.setState({ isCreateEventError: true, isInFlight: false })
          ));
      } else {
        this.setState({ isCreateEventError: false, isInFlight: true }, () =>
          createEvent(summary, description, startDateTime, endDateTime, timeZone, shouldSendNotification, options).then(
            event => onScheduleSubmit(startDateTime, event.id, shouldSendNotification),
            () => this.setState({ isCreateEventError: true, isInFlight: false })
          ));
      }
    });
    return false;
  };

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  toggleShouldSendNotification = () => this.setState({ shouldSendNotification: !this.state.shouldSendNotification })

  timeMask = "19:59pm";
  timePlaceholder = "HH:MMam";
  timeFormatChars = {
    1: '[0-1]',
    3: '[0-3]',
    5: '[0-5]',
    9: '[0-9]',
    p: '[a|p]',
    m: '[m]'
  };

  componentWillMount() {
    const { startTime } = this.props;
    const endTime = startTime.clone().add(30, 'minutes');

    this.setState({
      startDate: startTime.format('MM/DD/YY'),
      startTime: startTime.format('hh:mma'),
      endTime: endTime.format('hh:mma'),
      endDate: endTime.format('MM/DD/YY'),
      currentYear: moment().format('YYYY')
    });
  }

  render() {
    const { startDate, startTime, endTime, endDate, isInFlight, shouldSendNotification,
      isStartDateInvalid, isEndDateInvalid, isStartTimeInvalid, isEndTimeInvalid,
      isCreateEventError, isEndDateBeforeStart } = this.state;
    const { timeMask, timePlaceholder, timeFormatChars } = this;
    const { event } = this.props;

    return (
      <form onSubmit={this.onSubmit} className="form gutter-top schedule-timeslot-form">
        <fieldset>
          <div className="schedule-timeslot-inputs">
            <div className="schedule-timeslot-inputs-group">
              <label className="input-label" htmlFor="startDate">Start Date</label>
              <InputMask
                className="form-control"
                name="startDate"
                id="startDate"
                placeholder="MM/DD/YY"
                value={startDate}
                onChange={this.onChange}
                mask="19/39/99"
                formatChars={timeFormatChars}
              />
            </div>
            <div className="schedule-timeslot-inputs-group">
              <label className="input-label" htmlFor="startTime">Start time</label>
              <InputMask
                className="form-control"
                name="startTime"
                id="startTime"
                placeholder={timePlaceholder}
                value={startTime}
                onChange={this.onChange}
                mask={timeMask}
                formatChars={timeFormatChars}
              />
            </div>
            <div className="schedule-timeslot-inputs-group">
              <label className="input-label" htmlFor="endTime">End time</label>
              <InputMask
                className="form-control"
                name="endTime"
                id="endTime"
                placeholder={timePlaceholder}
                value={endTime}
                onChange={this.onChange}
                mask={timeMask}
                formatChars={timeFormatChars}
              />
            </div>
            <div className="schedule-timeslot-inputs-group">
              <label className="input-label" htmlFor="endDate">End date</label>
              <InputMask
                className="form-control"
                name="endDate"
                id="endDate"
                placeholder="MM/DD/YY"
                value={endDate}
                onChange={this.onChange}
                mask="19/39/99"
                formatChars={timeFormatChars}
              />
            </div>
          </div>
        </fieldset>
        {isStartDateInvalid && <p className="danger-text">Please enter a valid start date.</p>}
        {isEndDateInvalid && <p className="danger-text">Please enter a valid end date.</p>}
        {isStartTimeInvalid && <p className="danger-text">Please enter a valid start time.</p>}
        {isEndTimeInvalid && <p className="danger-text">Please enter a valid end time.</p>}
        {isEndDateBeforeStart && <p className="danger-text">Start date and time must be after end date and time.</p>}
        {isCreateEventError && <p className="danger-text">There was an error creating this meeting. If the problem persists please email <a href="mailto:support@goodchat.io">support@goodchat.io</a>.</p>}
        <fieldset>
          <label className="checkbox-label" htmlFor="sendNotification">
            <i className="material-icons">
              {shouldSendNotification ? 'check_box' : 'check_box_outline_blank'}
            </i>
            <input
              type="checkbox"
              id="sendNotification"
              name="sendNotification"
              checked={shouldSendNotification}
              onChange={this.toggleShouldSendNotification}
            /> Send notification
          </label>
        </fieldset>
        <fieldset className="align-right">
          <ul className="stacked-to-inline-list">
            <li>
              <button
                type="submit"
                className="btn-primary"
                disabled={isInFlight}
              >
                {(() => {
                  if (event) {
                    return isInFlight ? 'Updating...' : 'Update meeting time';
                  } else {
                    return isInFlight ? 'Creating...' : 'Create meeting';
                  }
                })()}
              </button>
            </li>
          </ul>
        </fieldset>
      </form>
    );
  }
};
