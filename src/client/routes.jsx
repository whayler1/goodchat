import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import superagent from 'superagent';
import { setTeams, setTeam } from './components/team/team.dux.js';
import App from './components/app/app.jsx';
import Home from './components/home/home.container.jsx';
import Teams from './components/team/teams.container.jsx';
import Team from './components/team/team.container.jsx';
import TeamInvite from './components/team/team.invite.container.jsx';

class Routes extends Component {
  static propTypes = {
    setTeams: PropTypes.func.isRequired,
    setTeam: PropTypes.func.isRequired
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
    console.log('onTeamEnter ! nextState', nextState.params.teamId);
    superagent.get(`team/${nextState.params.teamId}`).then(
      res => {
        console.log('onTeamEnter res', res);
        this.props.setTeam(res.body.team);
        callback();
      },
      err => console.log('err retrieving team', err)
    );
  }
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="/teams" component={Teams} onEnter={this.onTeamsEnter}/>
          <Route path="/teams/:teamId" onEnter={this.onTeamEnter}>
            <IndexRoute component={Team}/>
            <Route path="invite" component={TeamInvite}/>
          </Route>
        </Route>
      </Router>
    );
  }
};

export default connect(
  null,
  {
    setTeams,
    setTeam
  }
)(Routes);
