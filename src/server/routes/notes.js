const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const uuid = require('node-uuid');
const _ = require('lodash');

router.put('/note/:id', authHelpers.loginRequired, (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  knex('notes').where({ id })
  .update({
    note,
    updated_at: knex.fn.now()
  })
  .returning('*')
  .then(notes => res.json({ note: notes[0] }))
  .catch(err => res.status(500).json({ msg: 'error-updating-note' }))
});

module.exports = router;
