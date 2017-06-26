import superagent from 'superagent';
import _ from 'lodash';

const defaultState = {
  events: []
};

const SET_EVENT_LIST = 'calendar/event-list';

export const getEvents = () => dispatch => new Promise((resolve, reject) =>
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(res => {
    dispatch({
      type: SET_EVENT_LIST,
      events: res.result.items
    });
    resolve();
  }));

export const createEvent = (summary, description, startDateTime, endDateTime, timeZone, options) => dispatch => new Promise((resolve, reject) =>
  gapi.client.calendar.events.insert({
    calendarId: 'primary',
    sendNotifications: true,
    resource: {
      ...options,
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone
      }
    }
  }).then(
    res => {
      console.log('createEvent success', res);
      resolve();
    },
    err => {
      console.log('createEvent err', err);
      reject()
    }
  ));

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_EVENT_LIST:
    return {
      ...state,
      events: action.events
    }
    default:
    return state;
  }
};
