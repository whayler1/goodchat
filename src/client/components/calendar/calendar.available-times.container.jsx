import React, { PropTypes, Component } from 'react';
import moment from 'moment';

class TimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    endTime: PropTypes.object.isRequired,
    events: PropTypes.array,
    onTimeSlotSelected: PropTypes.func.isRequired,
    isCurrentMeetingStart: PropTypes.bool
  };

  onTimeSlotSelected = () => this.props.onTimeSlotSelected(this.props.startTime);

  getNewState = newProps => {
    const { startTime, endTime } = newProps;

    const events = newProps.events.map(event => {
      const evtStart = moment(event.start.dateTime);
      const evtEnd = moment(event.end.dateTime);

      const topPct = evtStart.isSameOrBefore(startTime) ? 0 : Math.round(evtStart.diff(startTime, 'minutes') / 30 * 100);
      const bottomPct = evtEnd.isSameOrAfter(endTime) ? 0 : 100 - Math.round(endTime.diff(evtEnd, 'minutes') / 30 * 100);
      console.log('evtStart', evtStart, '\nstartTime', startTime);
      const displayStr = evtStart.isSameOrAfter(startTime, 'minute') ?
        `${evtStart.format('h')}${evtStart.minutes() ? evtStart.format(':mm') : ''} - ${evtEnd.format('h')}${evtEnd.minutes() ? evtEnd.format(':mm') : ''} ${event.summary}` : null;

      return {
        ...event,
        topPct: `${topPct}%`,
        bottomPct: `${bottomPct}%`,
        displayStr
      };
    });

    return {
      btnId: `available-times-list-btn-${startTime.unix()}`,
      events,
      displayStr: events.filter(event => event.displayStr).map(event => event.displayStr).join(', ')
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getNewState(nextProps));
  }

  componentWillMount() {
    this.setState(this.getNewState(this.props));
  }

  render() {
    const { startTime, endTime } = this.props;
    const { btnId, events, displayStr } = this.state;

    return (
      <li>
        <label
          className="available-times-list-label"
          htmlFor={btnId}
        >
          {startTime.format('h:mmA')}
        </label>
        <div className="available-times-list-btn-col">
          <button
            id={btnId}
            name={btnId}
            type="button"
            className={`btn btn-block available-times-list-btn${this.props.isCurrentMeetingStart ? ' available-times-list-btn-active' : ''}`}
            onClick={this.onTimeSlotSelected}
          >
            {events.map(event => (
              <div
                key={event.id}
                className="available-times-list-btn-event"
                style={{
                  top: event.topPct,
                  bottom: event.bottomPct
                }}
              />
            ))}
            {displayStr ? <small>{displayStr}</small> : events.length ? <small>&nbsp;</small> : <small className="available-times-list-btn-hover-ui">Click to schedule</small>}
          </button>
        </div>
      </li>
    );
  }
}

export default class CalendarAvailableTimes extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    endTime: PropTypes.object.isRequired,
    events: PropTypes.array.isRequired,
    onTimeSlotSelected: PropTypes.func.isRequired,
    currentMeetingStartTime: PropTypes.object,
    currentMeetingEndTime: PropTypes.object
  };

  state = {
    timeSlots: [],
    events: []
  };

  getNewState = newState => {
    const { startTime, endTime } = newState;
    const start = startTime.clone();

    const events = newState.events.filter(event =>
      (moment(event.start.dateTime).isAfter(start) && moment(event.start.dateTime).isBefore(endTime)) ||
      (moment(event.end.dateTime).isAfter(start) && moment(event.end.dateTime).isBefore(endTime)));

    const remainder = 30 - start.minute() % 30;

    if (remainder < 30) {
      start.add('minutes', remainder).seconds(0);
    }

    const count = Math.round(endTime.diff(start, 'minutes') / 30);

    const timeSlots = _.times(count, (n) => ({
      startTime: start.clone().add(n * 30, 'minutes'),
      endTime: start.clone().add(((n + 1) * 30) - 1, 'minutes')
    })).map(timeSlot => Object.assign(timeSlot, {
      events: events.filter(event => {
        const evtStart = moment(event.start.dateTime);
        const evtEnd = moment(event.end.dateTime);
        const { startTime, endTime } = timeSlot;

        return (evtStart.isSameOrAfter(startTime) && evtStart.isBefore(endTime)) ||
          (evtEnd.isAfter(startTime) && evtEnd.isSameOrBefore(endTime)) ||
          (evtStart.isBefore(startTime) && evtEnd.isAfter(endTime));
      })
    }));

    return { timeSlots, events };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getNewState(nextProps));
  }

  componentWillMount() {
    this.setState(this.getNewState(this.props));
  }

  render() {
    const { currentMeetingStartTime } = this.props;
    const { timeSlots } = this.state;

    return (
      <ul className="available-times-list">
        {timeSlots.map((timeSlot, index) => (
          <TimeSlot
            key={index}
            onTimeSlotSelected={this.props.onTimeSlotSelected}
            isCurrentMeetingStart={currentMeetingStartTime && (currentMeetingStartTime.isSameOrAfter(timeSlot.startTime) && currentMeetingStartTime.isBefore(timeSlot.endTime))}
            {...timeSlot}
          />
        ))}
      </ul>
    );
  }
}
