import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';

import { createTodo, updateTodo, deleteTodo } from '../meeting/meeting.dux.js';

class TeamMemberDetailToDo extends Component {
  static propTypes = {
    id: PropTypes.string,
    isDone: PropTypes.boolean,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired,
    meetingId: PropTypes.string.isRequired,
    createTodo: PropTypes.func.isRequired,
    updateTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    text: PropTypes.string
  };

  state = {
    text: this.props.text || '',
    isEdit: _.isNil(this.props.id),
    isChecked: this.props.isDone
  };

  onChangeUpdate = _.debounce(() =>
    this.props.updateTodo(this.props.id, {
      text: this.state.text,
      is_done: this.state.isChecked
    }).then(
      () => this.setState({ isError: false }),
      () => this.setState({ isError: true })
    ), 750);

  onChange = e => this.setState({ text: e.target.value }, () =>
    _.isString(this.props.id) && this.onChangeUpdate());

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

  onDeleteClick = () => this.props.deleteTodo(this.props.id);

  toggleIsEdit = () => {
    // JW: need to timeout so delete can be clicked
    if (this.state.isEdit) {
      setTimeout(() => this.setState({ isEdit: false }), 250);
    } else {
      this.setState({ isEdit: true });
    }
  };

  onCheckboxChange = e => this.setState({ isChecked: e.target.checked }, this.onChangeUpdate);

  render() {
    const { id } = this.props;
    const { text, isEdit, isChecked } = this.state;
    const { onSubmit, onChange, toggleIsEdit } = this;

    const placeholder = id ? '' : 'Add an item...';
    const name = `todo-${id}`;
    const checkboxName = `todo-checkbox-${id}`;

    return (
      <form onSubmit={onSubmit} className={`meeting-todo-form clearfix ${ id ? '' : 'meeting-todo-form-add' }`}>
        {id &&
        <label htmlFor={checkboxName} className="checkbox-label">
          <input
            type="checkbox"
            id={checkboxName}
            name={checkboxName}
            checked={isChecked}
            onChange={this.onCheckboxChange}
          />
          <i className="material-icons">{isChecked ? 'check_box' : 'check_box_outline_blank'}</i>
        </label>
        }
        {(id && !isEdit) &&
        <ReactMarkdown
          className="team-markdown"
          source={text}
          containerProps={{ id: `name`, onClick: toggleIsEdit }}
          escapeHtml={true}
        />
        }
        {(!id || isEdit) &&
        <TextareaAutosize
          maxLength={1000}
          minLength={1}
          onChange={onChange}
          className={`form-control ${ (id || text.length > 0) ? '' : 'meeting-todo-form-control-add' }`}
          id={name}
          onBlur={toggleIsEdit}
          name={name}
          value={text}
          placeholder={placeholder}
          autoFocus={id}
          required
        />
        }
        {id && isEdit &&
        <ul className="pull-right inline-list meeting-qa-foot">
          <li>
            <button
              type="button"
              className="btn-no-style btn-no-style-danger"
              onClick={this.onDeleteClick}
            >
              Delete <i className="material-icons font-small">close</i>
            </button>
          </li>
        </ul>
        }
        {!id && text.length > 0 &&
        <div className="half-gutter-top">
          <button
            type="submit"
            className="btn-no-style btn-no-style-primary"
          >
            Add <i className="material-icons">add_circle_outline</i>
          </button>
        </div>
        }
      </form>
    );
  }
};

export default connect(
  null,
  {
    createTodo,
    updateTodo,
    deleteTodo
  }
)(TeamMemberDetailToDo);
