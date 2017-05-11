import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';

import { createTodo } from '../meeting/meeting.dux.js';

class TeamMemberDetailToDo extends Component {
  static propTypes = {
    id: PropTypes.string,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired,
    meetingId: PropTypes.string.isRequired,
    createTodo: PropTypes.func.isRequired,
    text: PropTypes.string
  };

  state = {
    text: this.props.text || ''
  };

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  onSubmit = e => {
    e.preventDefault();
    const { createTodo, teamId, meetingGroupId, meetingId } = this.props;
    const { text } = this.state;

    createTodo(teamId, meetingGroupId, meetingId, text).then(
      () => this.setState({
        text: '',
        isError: false
      }),
      () => this.setState({
        isError: true
      })
    );
    return false;
  };

  render() {
    const { id } = this.props;
    const { text } = this.state;
    const { onSubmit, onChange } = this;

    const placeholder = id ? '' : 'Add an item...';

    return (
      <form onSubmit={onSubmit}>
        <TextareaAutosize
          maxLength={1000}
          minLength={1}
          onChange={onChange}
          name="text"
          value={text}
          placeholder={placeholder}
          required
        />
        {text && text.length > 0 &&
        <button
          type="submit"
        >
          Add
        </button>}
      </form>
    );
  }
};

export default connect(
  null,
  {
    createTodo
  }
)(TeamMemberDetailToDo);
