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

  state = {
    todos: []
  }

  setOrderedTodos = todos => this.setState({
    todos: _.orderBy(todos, 'created_at', 'desc')
  })

  componentWillMount() {
    this.setOrderedTodos(this.props.todos);
  }

  componentWillUpdate(nextProps, nextState) {
    this.setOrderedTodos(nextProps.todos);
  }

  render() {
    const { teamId, meetingId, meetingGroupId, createTodo, updateTodo, deleteTodo } = this.props;
    const { todos } = this.state;

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
