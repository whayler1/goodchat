const passport = require('passport');
const knex = require('../db/connection');

module.exports = () => {

  passport.serializeUser((user, done) => {
    console.log('\n\n serializeUser');
    done(null, user.google_id);
  });

  passport.deserializeUser((google_id, done) => {
    console.log('\n\n deserializeUser');
    // done(null, user);
    knex('users').where({google_id}).first()
    .then((user) => { done(null, user); })
    .catch((err) => { done(err, null); });
  });

};
