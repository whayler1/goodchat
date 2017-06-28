import superagent from 'superagent';
import _ from 'lodash';

const defaultState = {
  events: []
};

const SET_EVENT_LIST = 'calendar/event-list';
const ADD_EVENT = 'calendar/add-event';
const SEND_EVENT_NOTIFICATION = 'calendar/send-event-notification';

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
      const event = res.result;
      dispatch({
        type: ADD_EVENT,
        event
      });
      resolve(event);
    },
    err => {
      console.log('createEvent err', err);
      reject();
    }
  ));

// export const sendEventNotification = eventId => (dispatch, getState) => new Promise((resolve, reject) =>
//   gapi.client.calendar.events.update({
//     calendarId: 'primary',
//     eventId,
//     sendNotifications: true,
//     resource: getState().calendar.events.find(event => event.id === eventId)
//   }).then(
//     res => {
//       console.log('sendEventNotification success', res);
//       resolve();
//     },
//     err => {
//       console.log('sendEventNotification error', err);
//       reject();
//     }
//   ));

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case SET_EVENT_LIST:
    return {
      ...state,
      events: action.events
    }
    case ADD_EVENT:
    return {
      ...state,
      events: [
        ...state.events,
        action.event
      ]
    }
    default:
    return state;
  }
};
