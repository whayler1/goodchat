const knex = require('../db/connection');
const Membership = require('../models/membership');

const membershipRequired = (req, res, next) => {
  const team_id = req.params.id || req.params.team_id
  const { id } = req.user;

  return new Membership({ 'team_id': team_id, 'user_id': id }).fetch({withRelated: ['team']})
  .then(membership => {
    if (membership) {
      req.membership = membership
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
