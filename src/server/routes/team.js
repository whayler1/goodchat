const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');
const membershipHelpers = require('../membership/_helpers');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const User = require('../models/user')
const Team = require('../models/team')
const Membership = require('../models/membership')

const sendMeetingEmail = (guestId, hostId, teamId, meetingId) => new Promise((resolve, reject) =>  {
  // create reusable transporter object using the default SMTP transport

  knex('users').where({ id: hostId }).orWhere({ id: guestId })
  .then(users => {
    const host = users.find(user => user.id === hostId);
    const guest = users.find(user => user.id === guestId);
    const hostName = `${host.given_name} ${host.family_name}`;

    const transporter = nodemailer.createTransport(process.env.INVITE_EMAIL_TRANSPORTER);

    const link = `http://www.goodchat.io/#/teams/${teamId}/meetings/${meetingId}`;
    const mailOptions = {
      from: '"Justin at Good Chat" <justin@goodchat.io>',
      to: guest.email,
      subject: `You have a new meeting with ${hostName} on Good Chat.`,
      text: `You have a new meeting with ${hostName} on Good Chat. Go to ${link} to see the meeting.`,
      html: `<p>You have a new meeting with ${hostName} on Good Chat. <a href="${link}">Click here</a> or go to ${link} to see the meeting.</p>`
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if (error){
        reject();
        console.log(error);
      } else {
        resolve();
        console.log('Message sent: ' + info.response);
      }
      transporter.close();
    });
  })
  .catch(err => {
    reject();
    console.log('\n\nerr sending meeting email', err);
  })});
// };

router.post('/team', authHelpers.loginRequired, (req, res, next)  => {
  const { id } = req.user;
  const teamId = uuid.v1();

  knex('teams').insert({
    id: teamId
  })
  .returning('*')
  .then(teams => {
    console.log('\n\nnew team!', teams);

    knex('memberships').insert({
      id: uuid.v1(),
      team_id: teamId,
      user_id: id,
      is_owner: true
    })
    .returning('*')
    .then(membership => {
      console.log('\n\nmembership created');

      knex('memberships').where({ user_id: id, team_id: teamId }).join('teams', {
        'memberships.team_id': 'teams.id'
      })
      .then(teams => {
        console.log('\n\nteams:', teams);
        res.json({ team: teams[0] });
      })
      .catch(err => res.sendStatus(500));
    })
    .catch(err => {
      res.sendStatus(500);
    });
  })
  .catch(err => {
    res.sendStatus(500);
  });
});

router.post('/team/:team_id/join/:invite_id', authHelpers.loginRequired, (req, res) => {
  const user_id = req.user.id;
  const { team_id, invite_id } = req.params;

  knex('invites').where({ id: invite_id }).first()
  .then(invite => {
    const { is_admin } = invite;
    if (!invite.is_used && team_id === invite.team_id) {
      knex('invites').where({ id: invite_id }).update({ is_used: true })
      .then(() => {
        knex('memberships').where({ user_id, team_id })
        .then(memberships => {
          if (memberships.length > 0) {
            res.json({ msg: 'membership-already-exists' });
          } else {
            knex('memberships').insert({
              id: uuid.v1(),
              user_id,
              team_id,
              is_admin
            })
            .returning('*')
            .then(newMembership => {
              knex('memberships').where({ team_id }).then(memberships => {
                const pairs = []
                memberships.forEach((item, index, ary) => {
                  const subAry = ary.slice(index, ary.length)
                  return subAry.forEach(subItem =>{
                    if (item !== subItem) pairs.push([item, subItem])
                  });
                });

                const pairsPromises = pairs.map(pair => new Promise((pairsResolve, pairsReject) => {
                  const meeting_group_id = uuid.v1();

                  knex('meeting_groups').insert({
                    id: meeting_group_id,
                    team_id
                  }).then(() => {
                    const pairPromises = pair.map(membership => new Promise((pairResolve, pairReject) => {
                      knex('meeting_group_memberships').insert({
                        id: uuid.v1(),
                        meeting_group_id,
                        user_id: membership.user_id
                      }).then(() => pairResolve())
                      .catch(err => {
                        pairReject();
                        res.sendStatus(500);
                      });
                    }));

                    Promise.all(pairPromises).then(() => pairsResolve());
                  })
                  .catch(err => {
                    pairsReject();
                    res.sendStatus(500);
                  });
                }));

                Promise.all(pairsPromises).then(() => res.sendStatus(200));
              })
              .catch(err => res.sendStatus(500));
            })
            .catch(err => res.sendStatus(500));
          }
        })
        .catch(err => res.sendStatus(500));
      })
      .catch(err => res.sendStatus(500));
    } else {
      res.sendStatus(400);
    }
  })
  .catch(err => res.sendStatus(500));
});

router.post('/team/:team_id/meeting/:meeting_group_id/invite/:meeting_id', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const {
    team_id,
    meeting_group_id,
    meeting_id
  } = req.params;

  const { isEmailSuppressed } = req.query;

  knex('meetings').where({ id: meeting_id })
  .update({ is_invite_sent: true })
  .returning('*')
  .then(meetings => {
    if (isEmailSuppressed) {
      res.json({ meeting: meetings[0] });
    } else {
      sendMeetingEmail(meetings[0].user_id, meetings[0].host_id, team_id, meeting_group_id).then(
        () => res.json({ meeting: meetings[0] }),
        () => res.status(500).json({ msg: 'error sending email' })
      );
    }
  })
  .catch(err => res.status(500).json({ msg: 'error finding meeting by id' }));
});

router.post('/team/:team_id/meeting/:meeting_group_id/', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const {
    team_id,
    meeting_group_id
  } = req.params;

  const {
    question1,
    question2,
    question3,
    question4,
    question5,
    answer1,
    answer2,
    answer3,
    answer4,
    answer5,
    is_done,
    meeting_date,
    qa_length,
    is_invite_sent,
    google_calendar_event_id
  } = req.body;

  const host_id = req.user.id;
  const meeting_id = uuid.v1()

  if (!meeting_date) {
    res.status(400).json({ msg: 'meeting-date-required' });
  }

  knex('meeting_group_memberships').where({ meeting_group_id })
  .then(meetingGroupMemberships => {
    const userMembership = Object.assign({}, meetingGroupMemberships.find(meetingGroupMembership => meetingGroupMembership.user_id !== host_id));
    const { user_id } = userMembership;

    const insertObj = _.omitBy({
      id: meeting_id,
      team_id,
      user_id,
      host_id,
      question1,
      question2,
      question3,
      question4,
      question5,
      answer1,
      answer2,
      answer3,
      answer4,
      answer5,
      is_done,
      meeting_date,
      qa_length,
      is_invite_sent,
      google_calendar_event_id
    },
    _.isNil);

    knex('meetings').insert(insertObj)
    .returning('*')
    .then(meeting => {
      knex('notes').insert({
        id: uuid.v1(),
        user_id,
        meeting_id
      })
      .then(() => knex('notes').insert({
        id: uuid.v1(),
        user_id: insertObj.host_id,
        meeting_id
      })
      .then(() => res.json({ meeting }))
      .catch(err => res.status(500).json({ msg: 'error-creating-host-note' }))
      )
      .catch(err => res.status(500).json({ msg: 'error-creating-user-note' }));
    })
    .catch(err => res.status(500).json({ msg: 'error inserting into meetings table' }));
  })
  .catch(err => res.status(500).json({ msg: 'error finding meeting group memberships'}));
});

router.post('/team/:team_id/meeting/:meeting_group_id/todo/:meeting_id', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const { team_id, meeting_group_id, meeting_id } = req.params;
  const { text } = req.body;
  const user_id = req.user.id;

  const insertObj = {
    id: uuid.v1(),
    user_id,
    meeting_group_id,
    meeting_id,
    text,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  };

  knex('todos').insert(insertObj)
  .returning('*')
  .then(todos => res.json(todos[0]))
  .catch(() => res.status(500).json({ msg: 'error creating todo' }))
});

router.get('/team', authHelpers.loginRequired, (req, res, next) => {
  const { id } = req.user;

  knex('memberships').where({ user_id: id }).join('teams', {
    'memberships.team_id': 'teams.id'
  })
  .then(teams => {
    res.json({ teams });
  })
  .catch(err => res.sendStatus(500));
});

router.get('/team/:id', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res, next) => {
  const membership = req.membership
  const team = membership.related('team')

  if (membership && team) {
    const membershipAttrs = membership.attributes
    const assignAttrs = {
      team_id: membershipAttrs.team_id,
      user_id: membershipAttrs.user_id,
      is_admin: membershipAttrs.is_admin,
      is_owner: membershipAttrs.is_owner
    }

    Object.assign(team.attributes, assignAttrs)
    res.json({ team })
  } else {
    res.sendStatus(500);
  }
});

router.get('/team/:team_id/unauth', (req, res) => {
  const { team_id } = req.params;

  knex('teams').where({ id: team_id }).first()
  .then(team => res.json({ team }))
  .catch(err => res.sendStatus(500));
});

router.get('/team/:team_id/invite', authHelpers.loginRequired, (req, res) => {
  const { team_id } = req.params;
  const { is_used } = req.body;

  console.log('\n\nteam invites\nteam_id', team_id, '\nis_used:', is_used);

  knex('invites').where({
    team_id,
    is_used: is_used || false
  })
  .then(invites => res.json({ invites }))
  .catch(err => res.sendStatus(500));
});

router.get('/team/:team_id/meetings/:meeting_group_id', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const { team_id, meeting_group_id } = req.params;
  const currentUserId = req.user.id;

  knex('todos').where({ user_id: currentUserId, meeting_group_id }).orderBy('created_at', 'desc').then(todos =>
    knex('meeting_groups').where({ id: meeting_group_id })
    .first()
    .then(meeting_group => knex('meeting_group_memberships').where({ meeting_group_id: meeting_group.id })
      .then(memberships => {
        if (memberships.some(membership => membership.user_id === currentUserId)) {
          meeting_group.memberships = memberships;
          // JW: This feels flimsy, but gets us what we need for now
          const user_id = memberships.find(membership => membership.user_id !== currentUserId).user_id;

          knex('meetings')
          .select([ 'meetings.*', 'notes.note', 'notes.id as note_id' ])
          .join('notes', { 'meetings.id': 'notes.meeting_id' })
          .orderBy('meeting_date', 'desc')
          .where({ 'meetings.team_id': team_id, 'meetings.host_id': currentUserId, 'meetings.user_id': user_id, 'notes.user_id': currentUserId })
          .orWhere({ 'meetings.team_id': team_id, 'meetings.host_id': user_id, 'meetings.user_id': currentUserId, 'notes.user_id': currentUserId })
          .then(meetings => {
            console.log('\n\ngot meetings success!', meetings);
            res.json({ meetings, meeting_group, todos });
          })
          .catch(err => res.status(500).json({ msg: 'error-retrieving-meetings-with-teamid-and-userid'}));
        } else {
          res.status(401).json({ msg: 'User not in this meeting' });
        }
      })
      .catch(err => res.sendStatus(500))
    )
    .catch(err => res.status(500).json({ msg: 'error-retrieving-meeting-groups-with-teamid-and-meeting-group-id'}))
  )
  .catch(() => res.status(500).json({ msg: 'error retrieving todos '}));
});

router.get('/team/:team_id/notes',authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const { team_id } = req.params;
  const user_id = req.user.id;

  knex('notes').where({ team_id, user_id })
});

router.get('/team/:team_id/membership', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const { team_id } = req.params;
  const user_id = req.user.id;

  knex('meeting_groups').where({ team_id }).then(meetingGroups => {
    const promises = meetingGroups.map(meetingGroup =>
      knex('meeting_group_memberships').where({ meeting_group_id: meetingGroup.id })
        .then(memberships => Object.assign(meetingGroup, { memberships }))
        .catch(err => res.sendStatus(500))
    );

    Promise.all(promises).then(() => {
      const userMeetingGroups = meetingGroups.filter(meetingGroup => meetingGroup.memberships.some(membership => membership.user_id === user_id));

      knex('memberships').select([
        'users.id',
        'users.given_name',
        'users.family_name',
        'users.email',
        'users.picture',
        'memberships.is_owner',
        'memberships.is_admin'])
      .join('users', { 'memberships.user_id': 'users.id'})
      .where({ team_id })
      .then(members => {

        Promise.all(members.map(member => new Promise((resolve, reject) => {
          member.meeting_group = userMeetingGroups.find(meetingGroup => meetingGroup.memberships.some(membership => membership.user_id === member.id));

          knex('meetings')
          .select('*')
          .orderBy('meeting_date', 'desc')
          .where({ team_id, 'host_id': user_id, user_id: member.id, is_done: false })
          .orWhere({ team_id, 'host_id': member.id, user_id, is_done: false })
          .first()
          .then(meeting => {
            console.log('\n-----meeting', meeting);
            if (meeting && meeting.meeting_date) {
              member.next_meeting_date = meeting.meeting_date;
            }
            resolve();
          })
          .catch(err => {
            console.log('\n-----meeting err', err);
            resolve();
          });
        }))).then(() => res.json({ members }));
      })
      .catch(err => res.status(500).json({ msg: 'error-retrieving-membership-with-teamid' }));
    });
  })
  .catch(err => res.sendStatus(500));
});

router.put('/team/:id', authHelpers.loginRequired, (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    name,
    question1,
    question2,
    question3,
    question4,
    question5
  } = req.body;

  console.log('\n\nput team', id, ', name:', name);

  knex('memberships').where({
    user_id: userId,
    team_id: id
  })
  .first()
  .then(membership => {

    if (!(membership.is_owner || membership.is_admin)) {
      res.sendStatus(403);
    } else {
      knex('teams').where({ id })
      .update(
        _.omitBy({
          name,
          question1,
          question2,
          question3,
          question4,
          question5,
          updated_at: knex.fn.now()
        },
        _.isNil)
      )
      .then(() => {
        knex('memberships').where({ user_id: userId, team_id: id })
        .join('teams', { 'memberships.team_id': 'teams.id' })
        .first()
        .then(team => res.json({ team }))
        .catch(err => res.sendStatus(500));
      })
      .catch(err => res.sendStatus(500));
    }
  })
  .catch(err => res.sendStatus(500));
});

router.delete('/team/:id', authHelpers.loginRequired, (req, res, next) => {
  const teamId = req.params.id;
  const userId = req.user.id;

  console.log('\n\ndelete\nteamId:', teamId, '\nuserId:', userId);

  knex('memberships').where({ team_id: teamId, user_id: userId })
  .then(memberships => {
    console.log('\n\nmemberships:', memberships);
    if (!memberships[0].is_owner) {
      res.sendStatus(403);
    } else {
      knex('memberships').del().where({ team_id: teamId, user_id: userId })
      .then(() => {
        console.log('\n\ndeleted membership');
        knex('teams').del().where({ id: teamId })
        .then(() => {
          console.log('\n\ndeleted team');
          res.json({});
        })
        .catch(err => res.sendStatus(500));
      })
      .catch(err => res.sendStatus(500));
    }
  })
  .catch(err => res.sendStatus(500));
})

module.exports = router;
