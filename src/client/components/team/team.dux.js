const defaultState = {
  teams: [],
  team: {}
};

const SET_TEAMS = 'team/set-teams';
const SET_TEAM = 'team/set-team';

export const setTeams = (teams) => ({
  type: SET_TEAMS,
  teams
});

export const setTeam = team => ({
  type: SET_TEAM,
  team
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_TEAMS:
      return {
        ...state,
        teams: action.teams
      };
    case SET_TEAM:
      return {
        ...state,
        team: action.team
      };
    default:
      return state;
  }
}
