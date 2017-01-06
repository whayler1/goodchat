import superagent from 'superagent';

const defaultState = {
  isLoggedIn: false,
  id: '',
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
      res => {
        const { id } = res.body;
        console.log('got it', res)
        dispatch({
          type: SET_LOGGED_IN,
          id,
          email,
          familyName,
          givenName,
          googleId,
          imageUrl
        });
      },
      err => alert('error with google auth on server')
    )
}

export const logout = () => (dispatch) => superagent.get('auth/logout')
  .then(
    res => {
      console.log('logout success');
      dispatch({
        type: LOGOUT
      });
    },
    err => console.log('logout fail')
  )

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_LOGGED_IN:
      const {id, email, familyName, givenName, googleId, imageUrl} = action;
      return {
        ...state,
        isLoggedIn: true,
        id,
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
        id: '',
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
