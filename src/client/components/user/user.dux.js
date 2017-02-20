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

export const setLoggedIn = idToken => (dispatch) => superagent.post('auth/google')
  .send({ idToken })
  .then(
    res => {
      const { id, email, family_name, given_name, google_id, picture } = res.body;
      console.log('got it', res.body)
      dispatch({
        type: SET_LOGGED_IN,
        id,
        email,
        familyName: family_name,
        givenName: given_name,
        googleId: google_id,
        imageUrl: picture
      });
    },
    err => alert('error with google auth on server')
  );

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
