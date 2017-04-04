const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');
const _ = require('lodash');
const nodemailer = require('nodemailer');

const sendMeetingAnsweredEmail = (guestId, hostId, teamId) => {
  // create reusable transporter object using the default SMTP transport

  knex('users').where({ id: hostId }).orWhere({ id: guestId })
  .then(users => {
    const host = users.find(user => user.id === hostId);
    const guest = users.find(user => user.id === guestId);
    const hostName = `${host.given_name} ${host.family_name}`;
    const guestName = `${guest.given_name} ${guest.family_name}`

    const transporter = nodemailer.createTransport(process.env.INVITE_EMAIL_TRANSPORTER);

    const link = `http://www.goodchat.io/#/teams/${teamId}/members/${guestId}`;
    const mailOptions = {
      from: '"Justin at Good Chat" <justin@goodchat.io>',
      to: host.email,
      subject: `${guestName} answered your questions on Good Chat.`,
      text: `${guestName} has finished answering your questions on Good Chat. Go to ${link} to see the meeting.`,
      html: `<p>${guestName} has finished answering your questions on Good Chat. <a href="${link}">Click here</a> or go to ${link} to see the meeting.</p>`
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
  })
  .catch(err => console.log('\n\nerr sending meeting email', err))
};

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
    meeting_date,
    qa_length
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
      qa_length,
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
      'are_answers_ready',
      'meeting_date',
      'finished_at',
      'qa_length'
    ),
    _.isUndefined
  ), { updated_at: knex.fn.now() });

  console.log('\n\nput meeting', id, '\n updateObj:', updateObj);

  knex('meetings').where({ id })
  .update(updateObj)
  .returning('*')
  .then(meetings => {
    const meeting = meetings[0];
    console.log('\n\n --> meeting', meeting);
    if (updateObj.are_answers_ready) {
      sendMeetingAnsweredEmail(meeting.user_id, meeting.host_id, meeting.team_id);
    }
    res.json({ meeting: meeting });
  })
  .catch(err => res.sendStatus(500));
});

router.delete('/meeting/:id', authHelpers.loginRequired, isMeetingMember, (req, res) => {
  const { id } = req.params;
  console.log('\n\ndeleting team', id);

  knex('meetings').del().where({ id })
  .then(() => res.sendStatus(200))
  .catch((err) => res.sendStatus(500));
});

module.exports = router;
