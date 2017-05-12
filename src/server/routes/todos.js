const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const _ = require('lodash');

router.put('/todos/:todo_id', authHelpers.loginRequired, (req, res) => {
  const { todo_id } = req.params;
  const user_id = req.user.id;

  const updateObj = {
    ...(_.omitBy(_.pick(req.body, 'text', 'is_done'), _.isNil)),
    updated_at: knex.fn.now()
  };

  /*
   * JW: I use user_id in the where clause as a cheap way of making sure only the
   * user who owns the todo can update it.
   */
  knex('todos').where({ id: todo_id, user_id })
  .update(updateObj)
  .returning('*')
  .then(todos => res.json({ todo: todos[0] }))
  .catch(() => res.status(500).json({ msg: 'error retrieving todo' }));
});

router.delete('/todos/:todo_id', authHelpers.loginRequired, (req, res) => {
  const { todo_id } = req.params;
  const user_id = req.user.id;

  knex('todos').del().where({ id: todo_id, user_id })
  .then(() => res.sendStatus(200))
  .catch(() => res.status(500).json({ msg: 'error retrieving todo' }));
});

module.exports = router;
