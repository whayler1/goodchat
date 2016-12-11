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
