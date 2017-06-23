import React, { Component, PropTypes } from 'react';
import InputMask from 'react-input-mask';

export default class TeamMemberDetailScheduleTimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired
  };

  onSubmit = e => {
    e.preventDefault();
    return false;
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  timeMask = "19:59pm";
  timePlaceholder = "HH:MMam";
  timeFormatChars = {
    1: '[0-1]',
    5: '[0-5]',
    9: '[0-9]',
    p: '[a|p]',
    m: '[m]'
  };

  componentWillMount() {
    const { startTime } = this.props;
    this.setState({
      startTime: startTime.clone().format('hh:mma'),
      endTime: startTime.clone().add(1, 'hour').format('hh:mma')
    });
  }

  render() {
    const { startTime, endTime } = this.state;
    const { timeMask, timePlaceholder, timeFormatChars } = this;

    return (
      <form onSubmit={this.onSubmit} className="form gutter-top">
        <fieldset>
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
        </fieldset>
        <fieldset>
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
        </fieldset>
      </form>
    );
  }
};
