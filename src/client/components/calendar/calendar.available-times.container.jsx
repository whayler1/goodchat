import React, { PropTypes, Component } from 'react';
import moment from 'moment';

class TimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    endTime: PropTypes.object.isRequired
  };

  render() {
    const { startTime, endTime } = this.props;

    return (
      <button
        type="button"
        className="btn btn-block available-times-list-btn"
      >
        {startTime.format('h:mmA')}
      </button>
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

    const remainder = 30 - start.minute() % 30;
    start.add('minutes', remainder).seconds(0);

    const count = Math.round(endTime.diff(start, 'minutes') / 30);

    const timeSlots = _.times(count, (n) => ({
      startTime: start.clone().add(n * 30, 'minutes'),
      endTime: start.clone().add((n + 1) * 30, 'minutes')
    }));

    const label = startTime.format('MMM DD, YYYY');

    const events = this.props.events.filter(event =>
      (moment(event.start.dateTime).isAfter(start) && moment(event.start.dateTime).isBefore(endTime)) ||
      (moment(event.end.dateTime).isAfter(start) && moment(event.end.dateTime).isBefore(endTime)));
    console.log('events', events);

    this.setState({ timeSlots, events, label });
  }

  render() {
    const { timeSlots, label } = this.state;

    return (
      <section>
        <span className="input-label">{label}</span>
        <ul className="available-times-list">
          {timeSlots.map((timeSlot, index) => (
            <li key={index}>
              <TimeSlot
                {...timeSlot}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }
}
