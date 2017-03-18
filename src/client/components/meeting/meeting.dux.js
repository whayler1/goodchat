import superagent from 'superagent';
import moment from 'moment';

const defaultState = {
  meetings: []
}

const SET_MEETINGS = 'meeting/set-meetings';
const UPDATE_MEETING = 'meeting/update-meeting';
const DELETE_MEETING = 'meeting/delete-meeting';

export const completeMeeting = meetingId => dispatch => new Promise((resolve, reject) => superagent.put(`meeting/${meetingId}`)
  .send({ is_done: true, finished_at: moment().format() })
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      const { meeting } = res.body;
      resolve(meeting);
    }
  }));

export const getMeetings = (teamId, memberId) => dispatch => new Promise((resolve, reject) => {
  console.log('getMeetings', teamId, '\n memberId', memberId);
  superagent.get(`team/${teamId}/meetings/${memberId}`)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        const { meetings } = res.body;

        dispatch({
          type: SET_MEETINGS,
          meetings
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

export const setMeetings = meetings => ({
  type: SET_MEETINGS,
  meetings
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_MEETINGS:
      return {
        ...state,
        meetings: action.meetings
      }
    case UPDATE_MEETING: {
      const index = state.meetings.findIndex(meeting => meeting.id === action.meeting.id);
      const meetings = [
        ...state.meetings.slice(0, index),
        action.meeting,
        ...state.meetings.slice(index + 1)
      ];
      return {
        ...state,
        meetings
      };
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
