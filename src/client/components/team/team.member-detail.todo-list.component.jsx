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
    updateTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired
  }

  render() {
    const { teamId, meetingId, meetingGroupId, todos, createTodo, updateTodo, deleteTodo } = this.props;

    return (
      <ul className="team-member-todo-list">
        <li>
          <TeamMemberDetailToDo
            teamId={teamId}
            meetingId={meetingId}
            meetingGroupId={meetingGroupId}
            createTodo={createTodo}
            updateTodo={updateTodo}
            deleteTodo={deleteTodo}
          />
        </li>
        {_.orderBy(todos.filter(todo => !todo.is_done), 'created_at', 'desc').map(todo => (
          <li key={todo.id}>
            <TeamMemberDetailToDo
              id={todo.id}
              isDone={todo.is_done}
              teamId={todo.team_id}
              text={todo.text}
              createTodo={createTodo}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
            />
          </li>)
        )}
      </ul>
    );
  }
};
