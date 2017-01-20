const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');

router.post('/meeting', authHelpers.loginRequired, (req, res, next) => {
  const hostId = req.user.id;
  const meetingId = uuid.v1();
  const {
    teamId,
    userId,
    question1,
    question2,
    question3,
    question4,
    question5,
    meeting_date
  } = req.params;

  if (!(teamId || userId)) {
    res.sendStatus(400);
  } else {
    knex('meetings').insert({
      id: meetingId,
      team_id: teamId,
      user_id: userId,
      question1,
      question2,
      question3,
      question4,
      question5,
      meeting_date: meetingDate
    })
    .returning('*')
    .then(meeting => {
      res.json({ meeting });
    })
  }
});
