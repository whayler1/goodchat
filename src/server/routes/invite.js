const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');

router.post('/invite', authHelpers.loginRequired, (req, res, next) => {
  const host_id = req.user.id;
  const id = uuid.v1();

  const {
    team_id,
    is_admin,
    invitee_email
  } = req.body;
  console.log('\n\ncreate invite\nteamId:', team_id, '\ninvitee_email', invitee_email);

  if (!(team_id || invitee_email)) {
    res.sendStatus(400);
  } else {
    knex('memberships').where({ team_id, user_id: host_id })
    .first()
    .then(membership => {
      console.log('\n\nmembership:', membership);
      const { is_owner, is_admin } = membership;
      if (is_owner || is_admin) {
        knex('invites').insert({
          id,
          team_id,
          host_id,
          invitee_email
        })
        .returning('*')
        .then(invite => {
          console.log('\n\ninvite success', invite);
          res.json({ invite });
        })
        .catch(err => res.sendStatus(500));
      } else {
        res.sendStatus(403);
      }
    })
    .catch(err => res.sendStatus(500));
  }
});

module.exports = router;
