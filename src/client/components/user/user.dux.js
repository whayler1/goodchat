import superagent from 'superagent';

const defaultState = {
  isLoggedIn: false,
  email: '',
  familyName: '',
  givenName: '',
  googleId: '',
  imageUrl: ''
};

const SET_LOGGED_IN = 'user/set-logged-in';
const LOGOUT = 'user/logout';

export const setLoggedIn = res => (dispatch) => {
  console.log('res:', res);
  // console.log('--', res.tokenId);
  const {email, familyName, givenName, googleId, imageUrl} = res.profileObj;
  superagent.post('auth/google')
    .send({ idToken: res.tokenId })
    .then(
      res => console.log('got it', res),
      err => console.log('error', err)
    )
  //
  // fetch('/auth/google', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   credentials: 'same-origin',
  //   body: JSON.stringify({
  //     idToken: res.tokenId
  //   })
  // }).then(
  //   json => {
  //     console.log('got back some json!', json);
  //
  //   }
  // );
  dispatch({
    type: SET_LOGGED_IN,
    email,
    familyName,
    givenName,
    googleId,
    imageUrl
  });
}

export const logout = () => (dispatch) => FB.logout(() => dispatch({ type: LOGOUT }));

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_LOGGED_IN:
      const {email, familyName, givenName, googleId, imageUrl} = action;
      return {
        ...state,
        isLoggedIn: true,
        email,
        familyName,
        givenName,
        googleId,
        imageUrl
      }
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        email: '',
        familyName: '',
        givenName: '',
        googleId: '',
        imageUrl: ''
      }
    default:
      return state;
  }
}
