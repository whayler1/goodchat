const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');
const nodemailer = require('nodemailer');

const sendInvite = (inviteeEmail, teamId, inviteId) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(process.env.INVITE_EMAIL_TRANSPORTER);

  // setup e-mail data with unicode symbols
  knex('teams').where({ id: teamId })
  .first()
  .then(team => {
    const { name } = team;
    const link = `${process.env.INVITE_EMAIL_PATH}${inviteId}`;

    const mailOptions = {
        from: '"Justin at Good Chat" <goochat.test@gmail.com>',
        to: inviteeEmail,
        subject: 'Your invite to join "${name}" on Good Chat!',
        text: `You've been invited to join the team "${name}" on goodchat.io. Go to ${link} to join!`,
        html: `<p>You've been invited to join the team "${name}" on goodchat.io. <a href="${link}">Click here</a> or go to ${link} to join!</p>`
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
        } else {
          console.log('Message sent: ' + info.response);
        }
        transporter.close();
    });
  });
};

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
        knex('invites').where({ team_id, invitee_email })
        .then(invites => {
          if (invites.length > 0) {
            console.log('\n\ninvites length over 0');
            res.status(400).json({ msg: 'email-exists' });
          } else {
            knex('invites').insert({
              id,
              team_id,
              host_id,
              invitee_email
            })
            .returning('*')
            .then(invite => {
              console.log('\n\ninvite success', invite);
              sendInvite(invitee_email, team_id, id);
              res.json({ invite });
            })
            .catch(err => res.sendStatus(500));
          }
        })
        .catch(err => res.sendStatus(500));
      } else {
        res.sendStatus(403);
      }
    })
    .catch(err => res.sendStatus(500));
  }
});

router.get('/invite/:invite_id', (req, res) => {
  const { invite_id } = req.params;
  console.log('\n\ninvite_id:', invite_id);

  knex('invites').where({
    id: invite_id
  })
  .first()
  .then(invite => {
    console.log('\n\ninvite', invite);
    res.json({ invite });
  })
  .catch(err => res.sendStatus(500));
});

router.delete('/invite/:invite_id', authHelpers.loginRequired, (req, res) => {
  const { invite_id } = req.params;

  knex('invites').del().where({ id: invite_id })
  .then(() => res.json({ msg: 'success' }))
  .catch(err => res.sendStatus(500));
});

module.exports = router;
