import superagent from 'superagent';
import moment from 'moment';

const defaultState = {
  meetings: [],
  meetingGroup: {},
  todos: []
}

const SET_MEETINGS = 'meeting/set-meetings';
const UPDATE_MEETING = 'meeting/update-meeting';
const DELETE_MEETING = 'meeting/delete-meeting';
const ADD_TODO = 'meeting/add-todo';
const UPDATE_TODO = 'meeting/update-todo';
const DELETE_TODO = 'meeting/delete-todo';

export const sendMeetingInvite = (teamId, meetingGroupId, meetingId) => dispatch =>
  new Promise((resolve, reject) => superagent.post(`team/${teamId}/meeting/${meetingGroupId}/invite/${meetingId}`)
  .end((err, res) => {
    if (err) {
      reject();
    } else {
      dispatch({
        type: UPDATE_MEETING,
        meeting: res.body.meeting
      });
      resolve();
    }
  }));

export const completeMeeting = meetingId => dispatch => new Promise((resolve, reject) => superagent.put(`meeting/${meetingId}`)
  .send({ is_done: true, finished_at: moment().format() })
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      const { meeting } = res.body;
      analytics.track('complete-meeting', {
        category: 'meeting',
        meetingId
      })
      resolve(meeting);
    }
  }));

export const getMeetings = (teamId, meetingGroupId) => dispatch => new Promise((resolve, reject) => {
  superagent.get(`team/${teamId}/meetings/${meetingGroupId}`)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        const { meetings, meeting_group, todos } = res.body;

        dispatch({
          type: SET_MEETINGS,
          meetings,
          meetingGroup: meeting_group,
          todos
        });
        resolve(meetings);
      }
    });
});

export const updateMeeting = (meetingId, updateObj) => dispatch => new Promise((resolve, reject) => superagent.put(`meeting/${meetingId}`)
  .send(updateObj)
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      const { meeting } = res.body;
      dispatch({
        type: UPDATE_MEETING,
        meeting
      });
      resolve(meeting);
    }
  }));

export const deleteMeeting = id => dispatch => new Promise(
  (resolve, reject) => superagent.delete(`meeting/${ id }`)
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      dispatch({
        type: DELETE_MEETING,
        id
      });
      resolve();
    }
  })
);

export const createTodo = (teamId, meetingGroupId, meetingId, text) => dispatch => new Promise((resolve, reject) =>
  superagent.post(`team/${teamId}/meeting/${meetingGroupId}/todo/${meetingId}`)
  .send({ text })
  .end((err, res) => {
    dispatch({
      type: ADD_TODO,
      todo: res.body
    });

    if (err) {
      reject(res);
    } else {
      resolve();
    }
  }));

export const updateTodo = (todo_id, options) => dispatch => new Promise((resolve, reject) => {
  superagent.put(`todos/${todo_id}`)
  .send(options)
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      dispatch({
        type: UPDATE_TODO,
        todo: res.body.todo
      });
      resolve(res.body);
    }
  })});

export const deleteTodo = (todo_id) => dispatch => new Promise((resolve, reject) =>
  superagent.delete(`todos/${todo_id}`)
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      dispatch({
        type: DELETE_TODO,
        todo_id
      });
      resolve();
    }
  }));

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_MEETINGS:
      return Object.assign({}, state, _.pick(action, 'meetings', 'meetingGroup', 'todos'));
    case UPDATE_MEETING: {
      const index = state.meetings.findIndex(meeting => meeting.id === action.meeting.id);
      const meetings = [
        ...state.meetings.slice(0, index),
        // JW: BOO BOO :/ Using object assign here since some items like `note_id` don't always come with the meeting object
        Object.assign({}, state.meetings[index], action.meeting),
        ...state.meetings.slice(index + 1)
      ];
      return {
        ...state,
        meetings
      };
    }
    case ADD_TODO: {
      const todos = [
        ...state.todos,
        action.todo
      ];
      return {
        ...state,
        todos
      }
    }
    case UPDATE_TODO: {
      const index = state.todos.findIndex(todo => todo.id === action.todo.id);
      const todos = [
        ...state.todos.slice(0, index),
        action.todo,
        ...state.todos.slice(index + 1)
      ];
      return {
        ...state,
        todos
      }
    }
    case DELETE_TODO: {
      const index = state.todos.findIndex(todo => todo.id === action.todo_id);
      const todos = [
        ...state.todos.slice(0, index),
        ...state.todos.slice(index + 1)
      ];
      return {
        ...state,
        todos
      }
    }
    case DELETE_MEETING: {
      const index = state.meetings.findIndex(meeting => meeting.id === action.id);
      const meetings = [
        ...state.meetings.slice(0, index),
        ...state.meetings.slice(index + 1)
      ];
      return {
        ...state,
        meetings
      };
    }
    default:
      return state;
  }
}
