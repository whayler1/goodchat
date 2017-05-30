import React, { Component, PropTypes } from 'react';

import TeamMemberDetailToDo from './team.member-detail.meeting.todo-item.component.jsx';

import _ from 'lodash';

export default class TeamMemberDetailTodoList extends Component {
  static propTypes = {
    teamId: PropTypes.string.isRequired,
    meetingId: PropTypes.string.isRequired,
    meetingGroupId: PropTypes.string.isRequired,
    todos: PropTypes.array.isRequired,
    createTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    todoStates: PropTypes.object.isRequired,
    onTodoCheckboxChange: PropTypes.func.isRequired,
    onTodoTextChange: PropTypes.func.isRequired,
  }

  render() {
    const { teamId, meetingId, meetingGroupId, todos, createTodo, deleteTodo, todoStates, onTodoTextChange, onTodoCheckboxChange } = this.props;

    return (
      <ul className="team-member-todo-list">
        <li>
          <TeamMemberDetailToDo
            teamId={teamId}
            idPrefix={'aside-'}
            meetingId={meetingId}
            meetingGroupId={meetingGroupId}
            createTodo={createTodo}
            deleteTodo={deleteTodo}
          />
        </li>
        {_.orderBy(todos.filter(todo => !todo.is_done), 'created_at', 'desc').map(todo => (
          <li key={todo.id}>
            <TeamMemberDetailToDo
              id={todo.id}
              idPrefix={'aside-'}
              isDone={todoStates[`todo-isdone-${todo.id}`]}
              teamId={todo.team_id}
              text={todoStates[`todo-text-${todo.id}`]}
              createTodo={createTodo}
              deleteTodo={deleteTodo}
              onTextChange={onTodoTextChange}
              onCheckboxChange={onTodoCheckboxChange}
            />
          </li>)
        )}
      </ul>
    );
  }
};
