const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

// router.post('/team', authHelpers.loginRedirect, (req, res, next)  => {
//   knex('teams').insert({
//     user_ids: `{${req.user.google_id}}`
//   }).returning('*')
//   .then(res => {
//     console.log('new team!', res);
//     res.json({msg: 'yay!'});
//   })
//   // knex('organizations').insert({
//   //
//   // })
// });

router.get('/team', authHelpers.loginRedirect, (req, res, next)  => {
  console.log('get team', req.user);
  knex('team').where({ user_ids: req.user.google_id })
  .returning('*')
  .then(team => {
    console.log('team return', team);
    res.json(team);
  })
  .catch(err => {
    console.log('err', err);
    res.json(err);
  });
});

module.exports = router;
