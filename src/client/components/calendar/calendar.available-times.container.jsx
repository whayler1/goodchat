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
        className="btn-primary-inverse btn-block"
      >
        {startTime.format('h:mmA')}
      </button>
    );
  }
}

export default class CalendarAvailableTimes extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired,
    endTime: PropTypes.object.isRequired
  };

  state = {
    timeSlots: []
  };

  componentWillMount() {
    const { startTime, endTime } = this.props;
    const start = startTime.clone();
    // console.log('%cdiff', 'background:pink', count);
    const remainder = 30 - start.minute() % 30;
    moment(start).add("minutes", remainder );

    const count = endTime.diff(start, 'minutes') / 30;

    const timeSlots = _.times(count, (n) => ({
      startTime: start.clone().add(n * 30, 'minutes'),
      endTime: start.clone().add((n + 1) * 30, 'minutes')
    }));
    console.log('timeSlots', timeSlots);

    const label = startTime.format('MMM DD, YY');

    this.setState({ timeSlots, label });
  }

  render() {
    const { timeSlots, label } = this.state;

    return (
      <section>
        <span className="input-label">{label}</span>
        <ul>
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
