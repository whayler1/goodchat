import superagent from 'superagent';
import _ from 'lodash';

const defaultState = {
  events: []
};

const SET_EVENT_LIST = 'calendar/event-list';
const ADD_EVENT = 'calendar/add-event';
const UPDATE_EVENT = 'calendar/update-event';
const DELETE_EVENT = 'calendar/delete-event';

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

export const updateEvent = (eventId, resource, sendNotifications) => (dispatch, getState) => new Promise((resolve, reject) =>
  gapi.client.calendar.events.update({
    calendarId: 'primary',
    eventId,
    sendNotifications,
    resource: Object.assign({}, getState().calendar.events.find(event => event.id === eventId), resource)
  }).then(
    res => {
      console.log('updateEvent success', res);
      const event = res.result;
      dispatch({
        type: UPDATE_EVENT,
        event
      });
      resolve(event);
    },
    err => {
      console.log('updateEvent error', err);
      reject();
    }
  ));

export const deleteEvent = eventId => dispatch => new Promise((resolve, reject) =>
  gapi.client.calendar.events.delete({
    calendarId: 'primary',
    sendNotifications: true,
    eventId
  }).then(
    res => {
      dispatch({
        type: DELETE_EVENT,
        eventId
      });
      resolve();
    },
    err => {
      console.error('calendar deleteEvent error', err);
      reject();
    }
  ));

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
    case UPDATE_EVENT: {
      const index = state.events.findIndex(event => event.id === action.event.id);
      const events = [
        ...state.events.slice(0, index),
        action.event,
        ...state.events.slice(index + 1)
      ];
      return {
        ...state,
        events
      };
    }
    case DELETE_EVENT: {
      const index = state.events.findIndex(event => event.id === action.eventId);
      const events = [
        ...state.events.slice(0, index),
        ...state.events.slice(index + 1)
      ];
      return {
        ...state,
        events
      }
    }
    default:
    return state;
  }
};
