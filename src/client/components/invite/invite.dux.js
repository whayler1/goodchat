const defaultState = {
  invites: []
};

const SET_INVITES = 'invite/set-invites';

export const setInvites = invites => {
  // console.log('res:', res);
  // // console.log('--', res.tokenId);
  // const {email, familyName, givenName, googleId, imageUrl} = res.profileObj;
  // superagent.post('auth/google')
  //   .send({ idToken: res.tokenId })
  //   .then(
  //     res => {
  //       console.log('got it', res)
  //       dispatch({
  //         type: SET_LOGGED_IN,
  //         email,
  //         familyName,
  //         givenName,
  //         googleId,
  //         imageUrl
  //       });
  //     },
  //     err => alert('error with google auth on server')
  //   )
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    // case SET_LOGGED_IN:
    //   const {email, familyName, givenName, googleId, imageUrl} = action;
    //   return {
    //     ...state,
    //     isLoggedIn: true,
    //     email,
    //     familyName,
    //     givenName,
    //     googleId,
    //     imageUrl
    //   }
    default:
      return state;
  }
}
