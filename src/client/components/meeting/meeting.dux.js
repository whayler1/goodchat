const defaultState = {
  meetings: []
}

const SET_MEETINGS = 'meeting/set-meetings';

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
    default:
      return state;
  }
}
