import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import superagent from 'superagent';
import { getTeams, setTeams, setTeam, getTeam, setMembers, updateTeamMembers } from './components/team/team.dux';
import { setRedirect } from './components/login/login.dux';
import { setInvites, setInvite } from './components/invite/invite.dux';
import { getMeetings } from './components/meeting/meeting.dux';
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
    getTeams: PropTypes.func.isRequired,
    setTeams: PropTypes.func.isRequired,
    setTeam: PropTypes.func.isRequired,
    getTeam: PropTypes.func.isRequired,
    setMembers: PropTypes.func.isRequired,
    setInvites: PropTypes.func.isRequired,
    setInvite: PropTypes.func.isRequired,
    updateTeamMembers: PropTypes.func.isRequired,
    setRedirect: PropTypes.func.isRequired,
    getMeetings: PropTypes.func.isRequired
  }

  onTeamsEnter = (nextState, replace, callback) => this.props.getTeams(
    res => {
      callback();
    },
    err => {
      this.props.setRedirect(`/teams`);
      replace('/');
      callback();
    }
  );

  onTeamEnter = (nextState, replace, callback) => {
    const { teamId } = nextState.params;
    const promises = [this.props.updateTeamMembers(teamId), this.props.getTeam(teamId)];
    promises.forEach(promise => promise.catch(err => {
      if (err.status === 401) {
        this.props.setRedirect(`/teams/${teamId}`);
        replace('/');
        callback();
      } else {
        replace('/teams');
        callback();
      }
    }));
    Promise.all(promises).then(() => callback());
  }

  onTeamInviteEnter = (nextState, replace, callback) => {
    superagent.get(`team/${nextState.params.teamId}/invite`)
    .end((err, res) => {
      if (err) {
        replace('/');
        callback();
        return console.log('err retrieving invites', err);
      }
      this.props.setInvites(res.body.invites);
      callback();
    });
  }

  onTeamMemberDetailEnter = (nextState, replace, callback) => {
    const { teamId, memberId } = nextState.params;
    const { getMeetings, setRedirect } = this.props;

    getMeetings(teamId, memberId).then(
      () => callback(),
      err => {
        if (err.status === 401) {
          setRedirect(`/teams/${teamId}/members/${memberId}`);
          replace('/');
          callback();
        } else {
          replace('/teams');
          callback();
        }
      }
    );
  };

  onInviteAcceptEnter = (nextState, replace, callback) => {
    console.log('invite accept enter', 'background:yellow');
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
          <Route path="/teams/:teamId" onEnter={this.onTeamEnter} component={Team}>
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
    getTeams,
    setTeams,
    setTeam,
    getTeam,
    setMembers,
    setInvites,
    setInvite,
    getMeetings,
    updateTeamMembers,
    setRedirect
  }
)(Routes);
