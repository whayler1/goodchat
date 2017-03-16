const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');
const _ = require('lodash');

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
      knex('notes').insert({
        id: uuid.v1(),
        user_id: userId
      })
      .then(() => knex('notes').insert({
        id: uuid.v1(),
        user_id: hostId
      })
      .then(() => res.json({ meeting }))
      .catch(err => res.send(500).json({ msg: 'error-creating-host-note' }))
      )
      .catch(err => res.send(500).json({ msg: 'error-creating-user-note' }))
    })
    .catch(err => res.sendStatus(500));
  }
});

const isMeetingMember = (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;

  return knex('meetings').where({ id }).first().then(meeting => {

    if (user_id === meeting.user_id || user_id === meeting.host_id) {
      if (meeting.is_done) {
        return res.status(401).json({ msg: 'meeting-is-done' });
      }
      return next();
    } else {
      return res.status(401).json({ msg: 'user is not a member of this meeting' });
    }
  })
  .catch(err => res.sendStatus(500));
}

router.put('/meeting/:id', authHelpers.loginRequired, isMeetingMember, (req, res) => {
  const { id } = req.params;
  const updateObj = _.assign(_.omitBy(
    _.pick(
      req.body,
      'question1',
      'question2',
      'question3',
      'question4',
      'question5',
      'answer1',
      'answer2',
      'answer3',
      'answer4',
      'answer5',
      'is_done',
      'meeting_date',
      'finished_at'
    ),
    _.isNil
  ), { updated_at: knex.fn.now() });

  console.log('\n\nput meeting', id, '\n updateObj:', updateObj);

  knex('meetings').where({ id })
  .update(updateObj)
  .returning('*')
  .then(meeting => res.json({ meeting: meeting[0] }))
  .catch(err => res.sendStatus(500));
});

module.exports = router;
