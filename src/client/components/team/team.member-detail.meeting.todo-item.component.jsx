import React, { Component, PropTypes } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';

export default class TeamMemberDetailToDo extends Component {
  static propTypes = {
    id: PropTypes.string,
    isDone: PropTypes.boolean,
    teamId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string,
    meetingId: PropTypes.string,
    createTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    onCheckboxChange: PropTypes.func.isRequired,
    onTextChange: PropTypes.func.isRequired,
    text: PropTypes.string
  };

  state = {
    isEdit: _.isNil(this.props.id)
  };

  onChange = e => {
    if (this.props.id) {
      this.props.onTextChange(this.props.id, e.target.value);
    } else {
      this.setState({ text: e.target.value });
    }
  }

  onCheckboxChange = e => this.props.onCheckboxChange(this.props.id, e.target.checked);

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

  componentWillMount() {
    if (!this.props.id) {
      this.setState({
        text: ''
      });
    }
  }

  render() {
    const { id, isDone } = this.props;
    const { isEdit, isSubmitting, isDeleting } = this.state;
    const { onSubmit, onChange, toggleIsEdit } = this;

    const placeholder = id ? '' : 'Add an item...';
    const idStr = id ? id : meetingId + '-new';
    const name = `todo-${idStr}`;
    const checkboxName = `todo-checkbox-${idStr}`;

    const text = id ? this.props.text : this.state.text;

    return (
      <form onSubmit={onSubmit} className={`meeting-todo-form clearfix${ id ? '' : ' meeting-todo-form-add' }${ isDone ? ' meeting-todo-form-checked' : ''}`}>
        {id &&
        <label htmlFor={checkboxName} className="checkbox-label meeting-todo-form-checkbox">
          <input
            type="checkbox"
            id={checkboxName}
            name={checkboxName}
            checked={isDone}
            onChange={this.onCheckboxChange}
          />
          <i className="material-icons">{isDone ? 'check_box' : 'check_box_outline_blank'}</i>
        </label>
        }
        {(id && !isEdit) &&
        <ReactMarkdown
          className="team-markdown meeting-todo-form-text"
          source={text}
          containerProps={{ id: name, onClick: toggleIsEdit }}
          escapeHtml={true}
        />
        }
        {(!id || isEdit) &&
        <div className="meeting-todo-form-text">
          <TextareaAutosize
            maxLength={1000}
            minLength={1}
            onChange={onChange}
            className={`form-control ${ (id || (text && text.length > 0)) ? '' : 'meeting-todo-form-control-add' }`}
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
        {!id && (text && text.length > 0) &&
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
