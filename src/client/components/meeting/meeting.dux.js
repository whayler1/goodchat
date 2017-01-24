const defaultState = {
  meetings: []
}

const SET_MEETINGS = 'meeting/set-meetings';
const UPDATE_MEETING = 'meeting/update-meeting';

export const setMeetings = meetings => ({
  type: SET_MEETINGS,
  meetings
});

export const updateMeeting = (meeting) => ({
  type: UPDATE_MEETING,
  meeting
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_MEETINGS:
      return {
        ...state,
        meetings: action.meetings
      }
    case UPDATE_MEETING:
      const index = state.meetings.findIndex(meeting => meeting.id === action.meeting.id);
      const meetings = [
        ...state.meetings.slice(0, index),
        action.meeting,
        ...state.meetings.slice(index + 1)
      ]
      return {
        ...state,
        meetings
      }
    default:
      return state;
  }
}
