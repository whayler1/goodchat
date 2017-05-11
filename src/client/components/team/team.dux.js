import superagent from 'superagent';
import _ from 'underscore';

import { logout } from '../user/user.dux.js';

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
        success(res.body.teams);
      }
    }
  });
}

export const getTeam = (teamId) => (dispatch, getState) => new Promise((resolve, reject) => {
  superagent.get(`team/${teamId}`)
  .end((err, res) => {
    if (err) {
      reject(res);
      dispatch(logout);
      console.log('err retrieving team', res)
    } else {
      const { team } = res.body;
      dispatch({
        type: SET_TEAM,
        team
      });
      resolve(team);
      console.log('%cteam success', 'background:yellowgreen', res.body.team);
    }
  });
})

export const updateTeam = (teamId, updateObj) => dispatch => new Promise((resolve, reject) => {
  superagent.put(`team/${teamId}`)
    .send(updateObj)
    .end((err, res) => {
      if (err) {
        reject();
        console.log('%cerr putting team', 'background:pink', res);
      } else {
        const { team } = res.body;
        console.log('%csuccess updating team!', 'background:yellowgreen', res);
        dispatch({
          type: SET_TEAM,
          team
        })
        resolve(res.body.team)
      }
    });
});

export const setTeams = teams => ({
  type: SET_TEAMS,
  teams
});

export const setTeam = team => ({
  type: SET_TEAM,
  team
});

export const updateTeamMembers = teamId => dispatch => new Promise((resolve, reject) => superagent.get(`team/${teamId}/membership`)
  .end((err, res) => {
    if (err) {
      reject(res);
      console.log('--update team members fail', res);
    } else {
      const { members } = res.body;
      dispatch({
        type: SET_MEMBERS,
        members
      });
      resolve(members)
    }
  }));

export const createMeeting = (teamId, meetingGroupId, meeting_date) => dispatch => new Promise((resolve, reject) =>
  superagent.post(`team/${teamId}/meeting/${meetingGroupId}`)
  .send({ meeting_date })
  .end((err, res) => {
    if (err) {
      reject(res);
    } else {
      resolve()
    }
  }));

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
