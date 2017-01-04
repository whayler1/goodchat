const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');

router.post('/invite', authHelpers.loginRequired, (req, res, next) => {
  const host_id = req.user.id;
  const id = uuid.v1();
  console.log('\n\ncreate invite');

  const {
    teamId,
    inviteeEmail
  } = req.params;

  if (!(teamId || inviteeEmail)) {
    res.sendStatus(400);
  } else {
    knex('invites').insert({
      id,
      team_id: teamId,
      host_id,
      invitee_email: inviteeEmail
    })
    .returning('*')
    .then(invite => {
      console.log('\n\ninvite success', invite);
      res.json({ invite });
    })
    .catch(err => res.sendStatus(500));
  }
});
