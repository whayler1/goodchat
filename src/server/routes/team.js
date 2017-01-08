const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');
const membershipHelpers = require('../membership/_helpers');

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
        knex('memberships').where({ user_id })
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
            .then(() => res.sendStatus(200))
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

router.get('/team', authHelpers.loginRequired, (req, res, next) => {
  console.log('\n\nget team', req.user);
  const { id } = req.user;

  knex('memberships').where({ user_id: id }).join('teams', {
    'memberships.team_id': 'teams.id'
  })
  .then(teams => {
    console.log('teams:', teams);
    res.json({ teams });
  })
  .catch(err => res.sendStatus(500));
});

router.get('/team/:id', authHelpers.loginRequired, (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;

  knex('memberships').where({
    user_id: userId,
    team_id: id
  })
  .first()
  .then(membership => {

    if (!membership) {
      res.sendStatus(403);
    } else {
      knex('memberships').where({ user_id: userId, team_id: id })
      .join('teams', {
        'memberships.team_id': 'teams.id'
      })
      .first()
      .then(team => {
        console.log('\n\nteam:', team);
        res.json({ team });
      })
      .catch(err => res.sendStatus(500));
    }
  })
  .catch(err => res.sendStatus(500));
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

router.get('/team/:team_id/membership', authHelpers.loginRequired, membershipHelpers.membershipRequired, (req, res) => {
  const { team_id } = req.params;
  const user_id = req.user.id;

  knex('memberships').select([
    'users.id',
    'users.given_name',
    'users.family_name',
    'users.email',
    'memberships.is_owner',
    'memberships.is_admin'])
  .join('users', { 'memberships.user_id': 'users.id'})
  .where({ team_id })
  .then(members => res.json({ members }))
  .catch(err => res.status(500).json({ msg: 'error-retrieving-membership-with-teamid' }));
});

router.put('/team/:id', authHelpers.loginRequired, (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;

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
      .update({
        name,
        updated_at: knex.fn.now()
      })
      .then(teams => {
        res.json({ team: teams[0] });
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
