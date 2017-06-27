import React, { Component, PropTypes } from 'react';
import InputMask from 'react-input-mask';

import moment from 'moment';
import momentTz from 'moment-timezone';

export default class TeamMemberDetailScheduleTimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    createEvent: PropTypes.func.isRequired,
    onScheduleSubmit: PropTypes.func.isRequired,
    guest: PropTypes.object.isRequired,
    givenName: PropTypes.string.isRequired,
    familyName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired
  };

  getDateTime = (date, time) => {
    const timeSplit = time.split(':');
    const isPm = timeSplit[1].search(/p/) > -1;
    const hour = isPm ? Number(timeSplit[0]) + 12 : timeSplit[0];
    const minutes = timeSplit[1].substr(0,2);

    return moment(date).hours(hour).minutes(minutes).format('YYYY-MM-DDThh:mm:00');
  }

  onSubmit = e => {
    e.preventDefault();
    const { guest, givenName, familyName, teamId, meetingGroupId,
      createEvent, onScheduleSubmit } = this.props;
    const { startDate, startTime, endDate, endTime } = this.state;

    const summary = `${givenName} ${familyName} <> ${guest.given_name} ${guest.family_name} | Good Chat`;
    const description = `https://www.goodchat.io/#/teams/${teamId}/meetings/${meetingGroupId}`;
    const startDateTime = this.getDateTime(startDate, startTime);
    const endDateTime = this.getDateTime(endDate, endTime);
    const timeZone = moment.tz.guess();

    const options = {
      attendees: [
        { email: guest.email }
      ]
    };

    console.log('summary', summary, '\n\ndescription', description, '\n\nstartDateTime', startDateTime,
      '\n\nendDateTime', endDateTime, '\n\n timeZone', timeZone);

    createEvent(summary, description, startDateTime, endDateTime, timeZone, options).then(
      () => onScheduleSubmit(startDateTime),
      () => this.setState({ isCreateEventError: true })
    );

    return false;
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value });

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
      endDate: endTime.format('MM/DD/YY')
    });
  }

  render() {
    const { startDate, startTime, endTime, endDate } = this.state;
    const { timeMask, timePlaceholder, timeFormatChars } = this;

    return (
      <form onSubmit={this.onSubmit} className="form gutter-top">
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
        <fieldset className="align-right">
          <ul className="stacked-to-inline-list">
            <li>
              <button
                type="submit"
                className="btn-primary"
              >
                Create meeting
              </button>
            </li>
          </ul>
        </fieldset>
      </form>
    );
  }
};
