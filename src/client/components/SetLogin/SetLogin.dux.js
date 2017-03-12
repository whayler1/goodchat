const defaultState = {
  loginError: {}
};

const SET_LOGIN_ERROR = 'set-login-error';
const CLEAR_LOGIN_ERROR = 'clear-login-error';

export const setLoginError = err => ({
  type: SET_LOGIN_ERROR,
  err
});

export const clearLoginError = () => ({ type: CLEAR_LOGIN_ERROR });

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_LOGIN_ERROR:
      return {
        ...state,
        loginError: action.err
      }
    case CLEAR_LOGIN_ERROR:
      return {
        ...state,
        loginError: {}
      }
    default:
      return state;
  }
};
