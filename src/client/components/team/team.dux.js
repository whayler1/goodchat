const defaultState = {
  teams: []
};

const SET_TEAMS = 'team/set-teams';
const GET_TEAMS = 'team/get-team';

export const setTeams = (teams) => ({
  type: SET_TEAMS,
  teams
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_TEAMS:
      return {
        ...state,
        teams: action.teams
      };
    default:
      return state;
  }
}
