const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

router.post('/organization', authHelpers.loginRedirect, (req, res, next)  => {
  knex('teams').insert({
    user_ids: `{${req.user.google_id}}`
  }).returning('*')
  .then(res => {
    console.log('new team!', res);
    res.json({msg: 'yay!'});
  })
  // knex('organizations').insert({
  //
  // })
});

// router.get('/organization', authHelpers.loginRedirect, (req, res, next)  => {
//   knex('organizations').where({})
// });

module.exports = router;
