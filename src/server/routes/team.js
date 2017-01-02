const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');

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
      .catch(err => res.status(500));
    })
    .catch(err => {
      res.status(500);
    });
  })
  .catch(err => {
    res.status(500);
  });
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
  .catch(err => res.status(500));
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
      res.status(403);
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
      .catch(err => res.status(500));
    }
  })
  .catch(err => res.status(500));
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
      res.status(403);
    } else {
      knex('teams').where({ id })
      .update({
        name,
        updated_at: knex.fn.now()
      })
      .then(teams => {
        res.json({ team: teams[0] });
      })
      .catch(err => res.status(500));
    }
  })
  .catch(err => res.status(500));
});

router.delete('/team/:id', authHelpers.loginRequired, (req, res, next) => {
  const teamID = req.params.id;

  teamQuery.then(team => {
    if (!team) {
      res.status(400).json({ msg: 'no team with that id' });
    } else if (team.owner === req.user.google_id) {
      // delete team
      teamQuery.del().then(res => {
        console.log('team successfully deleted');
        res.status(200);
      })
      .catch(err => res.status(500));
    } else {
      res.status(401).json({ msg: 'user does not have priviledges to delete this team' });
    }
  })
  .catch(err => {
    console.log('delete team error!', err);
  });
})

module.exports = router;
