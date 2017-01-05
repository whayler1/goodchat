const defaultState = {
  invites: [],
  invite: {}
};

const SET_INVITES = 'invite/set-invites';
const SET_INVITE = 'invite/set-invite';

export const setInvites = invites => ({
  type: SET_INVITES,
  invites
});

export const setInvite = invite => ({
  type: SET_INVITE,
  invite
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INVITES:
      const { invites } = action;
      return {
        ...state,
        invites
      }
    case SET_INVITE:
      return {
        ...state,
        invite: action.invite
      }
    default:
      return state;
  }
}
