const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');

router.post('/team', authHelpers.loginRequired, (req, res, next)  => {
  knex('teams').insert({
    id: uuid.v1(),
    owner: req.user.id
  }).returning('*')
  .then(team => {
    console.log('new team!', res);
    res.json({ team });
  })
  .catch(err => {
    res.status(500);
  });
  // knex('organizations').insert({
  //
  // })
});

router.get('/team', authHelpers.loginRequired, (req, res, next) => {
  console.log('\n\nget team', req.user);
  const { id } = req.user;
  knex('teams').whereRaw(`user_ids @> '{${id}}' OR admin_ids @> '{${id}}' OR owner = '${id}'`)
  .returning('*')
  .then(teams => {
    console.log('team return', teams);
    res.json({ teams });
  })
  .catch(err => {
    console.log('err', err);
    res.json(err);
  });
});

router.delete('/team/:id', authHelpers.loginRequired, (req, res, next) => {
  const teamID = req.params.id;
  const teamQuery = knex('teams').where({ id: teamId }).first().returning('*');

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
