const defaultState = {
  invites: []
};

const SET_INVITES = 'invite/set-invites';

export const setInvites = invites => ({
  type: SET_INVITES,
  invites
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INVITES:
      const { invites } = action;
      return {
        ...state,
        invites
      }
    default:
      return state;
  }
}
