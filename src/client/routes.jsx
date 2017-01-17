import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import superagent from 'superagent';
import { setTeams, setTeam, setMembers } from './components/team/team.dux';
import { setInvites, setInvite } from './components/invite/invite.dux';
import { setMeetings } from './components/meeting/meeting.dux';
import App from './components/app/app.jsx';
import Home from './components/home/home.container.jsx';
import Teams from './components/team/teams.container.jsx';
import Team from './components/team/team.container.jsx';
import TeamInvite from './components/team/team.invite.container.jsx';
import TeamMemberDetail from './components/team/team.member-detail.container.jsx';
import InviteAccept from './components/invite/invite.accept.container.jsx';
import User from './components/user/user.container.jsx';

class Routes extends Component {
  static propTypes = {
    setTeams: PropTypes.func.isRequired,
    setTeam: PropTypes.func.isRequired,
    setMembers: PropTypes.func.isRequired,
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
  setTeamMemberships = teamId => new Promise((resolve, reject) => {
    superagent.get(`team/${teamId}/membership`)
    .end((err, res) => {
      if (err) {
        reject();
        return console.log('--memberships fail', res);
      }
      this.props.setMembers(res.body.members);
      resolve();
      // console.log('%cmemberships success', 'background:yellowgreen', res.body.members);
    });
  });
  setTeam = teamId => new Promise((resolve, reject) => {
    superagent.get(`team/${teamId}`)
    .end((err, res) => {
      if (err) {
        reject();
        return console.log('err retrieving team', res)
      }
      this.props.setTeam(res.body.team);
      resolve();
    });
  });
  onTeamEnter = (nextState, replace, callback) => {
    const { teamId } = nextState.params;
    Promise.all([this.setTeamMemberships(teamId), this.setTeam(teamId)]).then(() => callback());
  }
  onTeamInviteEnter = (nextState, replace, callback) => {
    superagent.get(`team/${nextState.params.teamId}/invite`)
    .end((err, res) => {
      if (err) {
        return console.log('err retrieving invites', err);
      }
      this.props.setInvites(res.body.invites);
      callback();
    });
  }
  onTeamMemberDetailEnter = (nextState, replace, callback) => {
    const { teamId, memberId } = nextState.params;
    superagent.get(`team/${teamId}/meetings/${memberId}`)
      .end((err, res) => {
        if (err) {
          console.log('err retrieving meetings', res);
          callback();
          return;
        }
        console.log('team members res', res);
        const { meetings } = res.body;
        this.props.setMeetings(res.body.meetings);
        callback();
      });
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
  onUserEnter = (nextState, replace, callback) => {
    if (!this.props.isLoggedIn) {
      replace('/');
    }
    callback();
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
            <Route path="members/:memberId" onEnter={this.onTeamMemberDetailEnter} component={TeamMemberDetail}/>
          </Route>
          <Route path="/invites/accept/:inviteId" onEnter={this.onInviteAcceptEnter} component={InviteAccept}/>
          <Route path="/user" onEnter={this.onUserEnter} component={User}/>
        </Route>
      </Router>
    );
  }
};

export default connect(
  state => ({
    isLoggedIn: state.user.isLoggedIn
  }),
  {
    setTeams,
    setTeam,
    setMembers,
    setInvites,
    setInvite,
    setMeetings
  }
)(Routes);
