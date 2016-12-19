import superagent from 'superagent';

const defaultState = {
  teams: []
};

const SET_TEAMS = 'team/set-teams';

export const setTeams = () => (dispatch) => {
  superagent.get('/team')
  .then(
    res => {
      console.log('team:', res);
    },
    err => {
      console.log('err:', err);
    }
  );
}


export default function reducer(state = defaultState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
