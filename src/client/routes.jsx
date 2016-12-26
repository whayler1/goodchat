import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import superagent from 'superagent';
import {setTeams} from './components/team/team.dux.js';
import App from './components/app/app.jsx';
import Home from './components/home/home.container.jsx';
import Team from './components/team/team.container.jsx';
import TeamId from './components/team/team.id.container.jsx';

class Routes extends Component {
  static propTypes = {
    setTeams: PropTypes.array.isRequired
  }
  onTeamEnter = (nextState, replace, callback) => {
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
  onTeamIdEnter = (nextState, replace, callback) => {
    console.log('onTeamIdEnter !');
    callback();
  }
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="/team" onEnter={this.onTeamEnter}>
            <IndexRoute component={Team}/>
            <Route path="/:teamId" component={TeamId} onEnter={this.onTeamIdEnter}/>
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
