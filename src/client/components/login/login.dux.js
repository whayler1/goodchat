const defaultState = {
  redirect: '',
  response: null
}

const SET_REDIRECT = 'login/set-redirect';
const CLEAR_REDIRECT = 'login/clear-redirect';
const SET_RESPONSE = 'login/set-response';
const CLEAR_RESPONSE = 'login/clear-response';

export const setRedirect = redirect => ({
  type: SET_REDIRECT,
  redirect
});

export const setResponse = (response, redirect) => ({
  type: SET_RESPONSE,
  response,
  redirect: redirect || ''
});

export const clearResponse = () => ({ type: CLEAR_RESPONSE });

export const clearRedirect = () => ({ type: CLEAR_REDIRECT });

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_RESPONSE:
      return {
        ...state,
        response: action.response,
        redirect: action.redirect
      }
    case CLEAR_RESPONSE:
      return {
        ...state,
        response: null,
        redirect: ''
      }
    case SET_REDIRECT:
      return {
        ...state,
        redirect: action.redirect
      }
    case CLEAR_REDIRECT:
      return {
        ...state,
        redirect: ''
      }
    default:
      return state;
  }
};
