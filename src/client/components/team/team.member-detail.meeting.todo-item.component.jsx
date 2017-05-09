import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';

import { createTodo } from './team.dux.js';

class TeamMemberDetailToDo extends Component {
  static propTypes = {
    id: PropTypes.string,
    text: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired,
    meetingId: PropTypes.string.isRequired,
    createTodo: PropTypes.func.isRequired
  };

  state = {};

  onChange = e => console.log('onChange', e);

  onSubmit = (e) => {
    e.preventDefault();
    console.log('TeamMemberDetailToDo onSubmit');
    return false;
  };

  render() {
    const { text, id } = this.props;
    const { onSubmit, onChange } = this;

    const placeholder = id ? '' : 'Add an item...';

    return (
      <form onSubmit={onSubmit}>
        <TextareaAutosize
          maxLength={1000}
          onChange={onChange}
          value={text}
          placeholder={placeholder}
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
