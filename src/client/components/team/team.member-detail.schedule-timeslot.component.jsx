import React, { Component, PropTypes } from 'react';

export default class TeamMemberDetailScheduleTimeSlot extends Component {
  static propTypes = {
    startTime: PropTypes.object.isRequired
  };

  onSubmit = e => {
    e.preventDefault();
    return false;
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  componentWillMount() {
    const { startTime } = this.props;
    this.setState({
      startTime: startTime.clone(),
      endTime: startTime.clone().add(30, 'minutes')
    });
  }

  render() {
    const { startTime } = this.state;
    
    return (
      <form onSubmit={this.onSubmit} class="form">
        <fieldset>
          <label className="input-label">Start time</label>
          <input
            className="form-control"
            name="startTime"
            id="startTime"
            placeholder="HH:MM"
            value={startTime}
            onChange={this.onChange}
          />
        </fieldset>
      </form>
    );
  }
};
