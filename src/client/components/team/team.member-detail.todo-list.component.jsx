import React, { Component, PropTypes } from 'react';

import TeamMemberDetailToDo from './team.member-detail.meeting.todo-item.component.jsx';

export default class TeamMemberDetailTodoList extends Component {
  static propTypes = {
    todos: PropTypes.array.isRequired,
    createTodo: PropTypes.func.isRequired,
    updateTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired
  }

  render() {
    const { todos, createTodo, updateTodo, deleteTodo } = this.props;
    console.log('%ctodos', 'background:pink', todos);

    return (
      <ul>
        {todos.map(todo => (
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
