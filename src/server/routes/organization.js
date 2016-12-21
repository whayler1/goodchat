const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

router.post('organization', authHelpers.loginRequired, (req, res, next)  => {
  knex('teams').insert({
    user_ids: `{${req.user.google_id}}`
  }).returning('*')
  .then(teamres => {
    console.log('\n\nnew team!', teamres);
    // res.json({msg: 'yay!'});
    knex('organizations').insert({
      team_ids: `{${teamres.id}}`
    }).returning('*')
    .then(orgres => {
      console.log('\n\nnew org!', orgres);
      res.json(orgres);
    });
  });
});

// router.get('/organization', authHelpers.loginRedirect, (req, res, next)  => {
//   knex('organizations').where({})
// });

module.exports = router;
