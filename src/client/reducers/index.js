import { combineReducers } from 'redux';
import user from '../components/user/user.dux';
import navbar from '../components/navbar/navbar.dux';
import team from '../components/team/team.dux';
import invite from '../components/invite/invite.dux';
import meeting from '../components/meeting/meeting.dux';
import login from '../components/login/login.dux';
import calendar from '../components/calendar/calendar.dux';

export default combineReducers({
  user,
  navbar,
  team,
  invite,
  meeting,
  login,
  calendar
})
