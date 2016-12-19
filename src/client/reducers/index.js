import { combineReducers } from 'redux';
import user from '../components/user/user.dux';
import navbar from '../components/navbar/navbar.dux';
import team from '../components/team/team.dux';

export default combineReducers({
  user,
  navbar,
  team
})
