import React, { PropTypes, Component } from 'react';
import moment from 'moment';

class TimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    endTime: PropTypes.object.isRequired,
    events: PropTypes.array
  };

  componentWillMount() {
    const { startTime, endTime } = this.props;

    const events = this.props.events.map(event => {
      const evtStart = moment(event.start.dateTime);
      const evtEnd = moment(event.end.dateTime);

      const topPct = (() => {
        if (evtStart.isSameOrBefore(startTime)) {
          return 0;
        }
        return Math.round(evtStart.diff(startTime, 'minutes') / 30 * 100);
      })();

      const bottomPct = (() => {
        if (evtEnd.isSameOrAfter(endTime)) {
          return 0;
        }
        return 100 - Math.round(endTime.diff(evtEnd, 'minutes') / 30 * 100);
      })();

      const displayStr = evtStart.isSameOrAfter(startTime) ?
        `${evtStart.format('h')}${evtStart.minutes() ? evtStart.format(':mm') : ''} - ${evtEnd.format('h')}${evtEnd.minutes() ? evtEnd.format(':mm') : ''} ${event.summary}` : null;

      return {
        ...event,
        topPct: `${topPct}%`,
        bottomPct: `${bottomPct}%`,
        displayStr
      };
    });

    console.log('- btn events', events);

    this.setState({
      btnId: `available-times-list-btn-${startTime.unix()}`,
      events,
      displayStr: events.filter(event => event.displayStr).map(event => event.displayStr).join(', ')
    });
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
            className="btn btn-block available-times-list-btn"
            ref={el => this.buttonEl = el}
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
    events: PropTypes.array.isRequired
  };

  state = {
    timeSlots: [],
    events: []
  };

  componentWillMount() {
    const { startTime, endTime } = this.props;
    const start = startTime.clone();

    const events = this.props.events.filter(event =>
      (moment(event.start.dateTime).isAfter(start) && moment(event.start.dateTime).isBefore(endTime)) ||
      (moment(event.end.dateTime).isAfter(start) && moment(event.end.dateTime).isBefore(endTime)));

    const remainder = 30 - start.minute() % 30;
    start.add('minutes', remainder).seconds(0);

    const count = Math.round(endTime.diff(start, 'minutes') / 30);

    const timeSlots = _.times(count, (n) => ({
      startTime: start.clone().add(n * 30, 'minutes'),
      endTime: start.clone().add((n + 1) * 30, 'minutes')
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

    const label = startTime.format('ddd MMM DD, YYYY');

    console.log('events', events);
    console.log('timeSlots', timeSlots);

    this.setState({ timeSlots, events, label });
  }

  render() {
    const { timeSlots, label } = this.state;

    return (
      <section>
        <span className="input-label">{label}</span>
        <ul className="available-times-list">
          {timeSlots.map((timeSlot, index) => (
            <TimeSlot
              key={index}
              {...timeSlot}
            />
          ))}
        </ul>
      </section>
    );
  }
}
