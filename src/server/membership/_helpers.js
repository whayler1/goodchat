const knex = require('../db/connection');

const membershipRequired = (req, res, next) => {
  const { team_id } = req.params;
  const { id } = req.user;

  return knex('memberships').where({ team_id, user_id: id })
  .then(memberships => {
    if (memberships.length > 0) {
      return next();
    } else {
      res.status(401).json({ msg: 'membership-required' });
    }
  })
  .catch(err => res.status(500).json({ msg: 'server-error-in-membership-required' }));
};

module.exports = {
  membershipRequired
};
