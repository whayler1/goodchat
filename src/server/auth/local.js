const passport = require('passport');
const bcrypt = require('bcryptjs');
const uuid = require('node-uuid');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-web');

const knex = require('../db/connection');
const authHelpers = require('./_helpers');

const options = {};

// passport.use(new LocalStrategy(options, (username, password, done) => {
//   // check to see if the username exists
//   console.log('local strategy called - User');
//   knex('users').where({ username }).first()
//   .then((user) => {
//     if (!user) return done(null, false);
//     if (!authHelpers.comparePass(password, user.password)) {
//       return done(null, false);
//     } else {
//       return done(null, user);
//     }
//   })
//   .catch((err) => { return done(err); });
// }));

passport.use(new GoogleStrategy(function(token, profile, done) {
  console.log('\n\n google strategy profile:', profile, '\n\n');
  knex('users').where({ google_id: profile.id }).first()
  .then(user => {
    if (!user) {
      console.log('\n\nnot user');
      knex('users')
      .insert({
        id: uuid.v1(),
        email: profile.email,
        family_name: profile.familyName,
        given_name: profile.givenName,
        picture: profile.picture,
        google_id: profile.id
      })
      .returning('*')
      .then(userres => {
        console.log('\n\nuserres:', userres);
        return done(null, userres[0]);
      })
      .catch((err) => done(err));
    } else {
      console.log('\n\nthere is user', user);
      knex('users').where({ google_id: profile.id })
      .update({
        family_name: profile.familyName,
        given_name: profile.givenName,
        picture: profile.picture
      })
      .returning('*')
      .then(userres => {
        console.log('updated user:', userres[0]);
        return done(null, userres[0]);
      })
      .catch((err) => done(err));
    }
  })
  .catch((err) => done(err));
}));

module.exports = passport;
