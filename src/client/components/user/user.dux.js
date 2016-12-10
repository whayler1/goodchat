const defaultState = {
  isLoggedIn: false,
  email: '',
  id: '',
  name: '',
  picture: {}
};

const SET_LOGGED_IN = 'user/set-logged-in';
const LOGOUT = 'user/logout';

export const setLoggedIn = fbUser => {
  console.log('fbUser:', fbUser);
  const {email, id, name, picture} = fbUser;
  return {
    type: SET_LOGGED_IN,
    isLoggedIn: true,
    email,
    id,
    name,
    picture
  };
}

export const logout = () => (dispatch) => FB.logout(() => dispatch({ type: LOGOUT }));

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_LOGGED_IN:
      const {email, id, name, picture} = action;
      return {...state,
        isLoggedIn: action.isLoggedIn,
        email,
        id,
        name,
        picture
      }
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        email: '',
        id: '',
        name: '',
        picture: {}
      }
    default:
      return state;
  }
}
