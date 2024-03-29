import superagent from 'superagent';
import _ from 'lodash';

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

export const login = () => dispatch => window.gapi.auth2.getAuthInstance().signIn().then(
  res => {
    console.log('%clogin', 'background:aqua');
    dispatch(setLoggedIn(res.getAuthResponse().id_token));
  },
  err => console.log('login err:', err)
);

export const setLoggedIn = idToken => (dispatch) => new Promise((resolve, reject) => superagent.post('auth/google')
  .send({ idToken })
  .then(
    res => {
      if (!_.isNil(res.body) && !_.isNil(res.body.id)) {
        const { id, email, family_name, given_name, google_id, picture } = res.body;
        dispatch({
          type: SET_LOGGED_IN,
          id,
          email,
          familyName: family_name,
          givenName: given_name,
          googleId: google_id,
          imageUrl: picture
        });
        resolve();
        window.analytics.identify(id, {
          name: `${given_name} ${family_name}`,
          firstName: given_name,
          lastName: family_name,
          email
        });
      } else {
        reject();
        console.log('error logging in', res);
      }
    },
    err => {
      reject();
      alert('error with google auth on server');
    }
  ));

export const logout = () => dispatch => window.gapi.auth2.getAuthInstance().signOut().then(
  res => superagent.get('auth/logout')
    .then(
      res => dispatch({ type: LOGOUT }),
      err => console.log('logout fail')
    )
);

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
