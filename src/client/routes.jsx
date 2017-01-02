import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import superagent from 'superagent';
import {setTeams} from './components/team/team.dux.js';
import App from './components/app/app.jsx';
import Home from './components/home/home.container.jsx';
import Teams from './components/team/teams.container.jsx';
import Team from './components/team/team.container.jsx';

class Routes extends Component {
  static propTypes = {
    setTeams: PropTypes.array.isRequired
  }
  onTeamsEnter = (nextState, replace, callback) => {
    superagent.get('team').then(
      res => {
        console.log('onTeamEnter es:', res);
        this.props.setTeams(res.body.teams);
        callback();
      },
      err => {
        console.log('-get team error', err);
        replace('/');
        callback();
      }
    )
  }
  onTeamEnter = (nextState, replace, callback) => {
    console.log('onTeamIdEnter !');
    callback();
  }
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="/teams" onEnter={this.onTeamsEnter}>
            <IndexRoute component={Teams}/>
            <Route path=":teamId" component={Team} onEnter={this.onTeamEnter}/>
          </Route>
        </Route>
      </Router>
    );
  }
};

export default connect(
  null,
  {
    setTeams
  }
)(Routes);
