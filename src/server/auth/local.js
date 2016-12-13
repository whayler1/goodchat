const passport = require('passport');
const bcrypt = require('bcryptjs');
const uuid = require('node-uuid');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-web');

const init = require('./passport');
const knex = require('../db/connection');
const authHelpers = require('./_helpers');

const options = {};

passport.use(new LocalStrategy(options, (username, password, done) => {
  // check to see if the username exists
  console.log('local strategy called');
  knex('users').where({ username }).first()
  .then((user) => {
    if (!user) return done(null, false);
    if (!authHelpers.comparePass(password, user.password)) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  })
  .catch((err) => { return done(err); });
}));

passport.use(new GoogleStrategy(function(token, profile, done) {
  // User.findOrCreate({ googleId: profile.id }, function(err, user) {
  //   return cb(err, user);
  // });
  console.log('-google strategy token!', token);
  console.log('google strategy profile:', profile);
  knex('users').where({ google_id: profile.id }).first()
  .then(user => {
    if (!user) {
      console.log('not user');
      // return done(null, false);
      knex('users')
      .insert({
        email: profile.email,
        family_name: profile.familyName,
        given_name: profile.givenName,
        google_id: profile.id
      })
      .returning('*')
      .then(userres => {
        console.log('userres:', userres);
        return done(null, userres);
      })
    } else {
      console.log('there is user', user);
      return done(null, user);
    }
  })
  .catch((err) => { return done(err); });
}));

module.exports = passport;
