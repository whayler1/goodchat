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

export const setLoggedIn = profileObj => {
  console.log('googleProfile:', profileObj);
  const {email, familyName, givenName, googleId, imageUrl} = profileObj;

  fetch('/auth/login/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      family_name: familyName,
      given_name: givenName,
      google_id: googleId,
      image_url: imageUrl
    })
  }).then(
    res => console.log('google login res:', res),
    err => console.log('google ERR', err)
  );

  return {
    type: SET_LOGGED_IN,
    email,
    familyName,
    givenName,
    googleId,
    imageUrl
  };
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
