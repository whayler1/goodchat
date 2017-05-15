import React, { Component, PropTypes } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';

export default class TeamMemberDetailToDo extends Component {
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

    this.setState({ isSubmitting: true }, () => {
      const { createTodo, teamId, meetingGroupId, meetingId } = this.props;
      const { text } = this.state;

      createTodo(teamId, meetingGroupId, meetingId, text).then(
        () => this.setState({
          text: '',
          isError: false,
          isSubmitting: false
        }),
        () => this.setState({
          isError: true,
          isSubmitting: false
        })
      );
    });
    return false;
  };

  onDeleteClick = () => this.setState({ isDeleting: true }, () =>
    this.props.deleteTodo(this.props.id));

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
    const { text, isEdit, isChecked, isSubmitting, isDeleting } = this.state;
    const { onSubmit, onChange, toggleIsEdit } = this;

    const placeholder = id ? '' : 'Add an item...';
    const name = `todo-${id}`;
    const checkboxName = `todo-checkbox-${id}`;

    return (
      <form onSubmit={onSubmit} className={`meeting-todo-form clearfix ${ id ? '' : 'meeting-todo-form-add' }`}>
        {id &&
        <label htmlFor={checkboxName} className="checkbox-label meeting-todo-form-checkbox">
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
          className="team-markdown meeting-todo-form-text"
          source={text}
          containerProps={{ id: `name`, onClick: toggleIsEdit }}
          escapeHtml={true}
        />
        }
        {(!id || isEdit) &&
        <div className="meeting-todo-form-text">
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
            readOnly={!id && isSubmitting}
            required
          />
        </div>
        }
        {id && isEdit &&
        <ul className="pull-right inline-list meeting-qa-foot">
          <li>
            <button
              type="button"
              className="btn-no-style btn-no-style-primary"
              onClick={toggleIsEdit}
            >
              Done editing <i className="material-icons font-small">done</i>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="btn-no-style btn-no-style-danger"
              onClick={this.onDeleteClick}
              disabled={isDeleting}
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
            disabled={isSubmitting}
          >
            {!isSubmitting && <span>Add <i className="material-icons">add_circle_outline</i></span>}
            {isSubmitting && <span>Saving...</span>}
          </button>
        </div>
        }
      </form>
    );
  }
};
