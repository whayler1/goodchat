import superagent from 'superagent';
import _ from 'underscore';

const defaultState = {
  teams: [],
  team: {},
  members: []
};

const SET_TEAMS = 'team/set-teams';
const SET_TEAM = 'team/set-team';
const SET_MEMBERS = 'team/set-members';

export const getTeams = (success, fail) => (dispatch, getState) => {
  superagent.get('team')
  .end((err, res) => {
    if (err) {
      console.log('failed to get teams', res);
      if (_.isFunction(fail)) {
        fail(res);
      }
    } else {
      dispatch({
        type: SET_TEAMS,
        teams: res.body.teams
      });
      if (_.isFunction(success)) {
        success();
      }
    }
  });
}

export const setTeams = teams => ({
  type: SET_TEAMS,
  teams
});

export const setTeam = team => ({
  type: SET_TEAM,
  team
});

export const updateTeamMembers = teamId => dispatch => superagent.get(`team/${teamId}/membership`)
  .end((err, res) => {
    if (err) {
      return console.log('--update team members fail', res);
    }
    dispatch({
      type: SET_MEMBERS,
      members: res.body.members
    });
  });

export const setMembers = members => ({
  type: SET_MEMBERS,
  members
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_TEAMS:
      return {
        ...state,
        teams: action.teams
      };
    case SET_TEAM:
      const index = state.teams.findIndex(team => team.id === action.team.id);
      let teams;
      if (index > -1) {
        teams = [
          ...state.teams.slice(0, index),
          action.team,
          ...state.teams.slice(index + 1)
        ];
      } else {
        teams = [
          ...state.teams,
          action.team
        ];
      }
      return {
        ...state,
        team: action.team,
        teams
      };
    case SET_MEMBERS:
      return {
        ...state,
        members: action.members
      }
    default:
      return state;
  }
}
