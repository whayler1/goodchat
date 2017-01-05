import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import superagent from 'superagent';
import { setTeams, setTeam } from './components/team/team.dux';
import { setInvites, setInvite } from './components/invite/invite.dux';
import App from './components/app/app.jsx';
import Home from './components/home/home.container.jsx';
import Teams from './components/team/teams.container.jsx';
import Team from './components/team/team.container.jsx';
import TeamInvite from './components/team/team.invite.container.jsx';
import InviteAccept from './components/invite/invite.accept.container.jsx';

class Routes extends Component {
  static propTypes = {
    setTeams: PropTypes.func.isRequired,
    setTeam: PropTypes.func.isRequired,
    setInvites: PropTypes.func.isRequired,
    setInvite: PropTypes.func.isRequired
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
    const { teamId } = nextState.params;
    console.log('onTeamEnter ! nextState', teamId);
    // Promise.all([
    //   new Promise((resolve, reject) => {
    //
    //   }),
    //   new Promise()
    // ])
    superagent.get(`team/${teamId}/membership`).then(
      res => {
        console.log('memberships success', res);
      },
      err => console.log('memberships fail', err)
    );
    superagent.get(`team/${teamId}`).then(
      res => {
        console.log('onTeamEnter res', res);
        this.props.setTeam(res.body.team);
        callback();
      },
      err => console.log('err retrieving team', err)
    );
  }
  onTeamInviteEnter = (nextState, replace, callback) => {
    superagent.get(`team/${nextState.params.teamId}/invite`).then(
      res => {
        this.props.setInvites(res.body.invites);
        callback();
      },
      err => console.log('err retrieving invites')
    );
  }
  onInviteAcceptEnter = (nextState, replace, callback) => {
    superagent.get(`invite/${nextState.params.inviteId}`).then(
      res => {
        const { invite } = res.body;
        console.log('invite:', invite);
        this.props.setInvite(invite);

        superagent.get(`team/${invite.team_id}/unauth`).then(
          res => {
            this.props.setTeam(res.body.team);
            callback();
          },
          err => console.log('err loading invite team')
        );
      },
      err => {
        this.props.setInvite({});
        this.props.setTeam({});
        callback();
      }
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
            <Route path="invite" component={TeamInvite} onEnter={this.onTeamInviteEnter}/>
          </Route>
          <Route path="/invites/accept/:inviteId" onEnter={this.onInviteAcceptEnter} component={InviteAccept}/>
        </Route>
      </Router>
    );
  }
};

export default connect(
  null,
  {
    setTeams,
    setTeam,
    setInvites,
    setInvite
  }
)(Routes);
