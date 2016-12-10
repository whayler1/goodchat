const passport = require('passport');
const bcrypt = require('bcryptjs');
const uuid = require('node-uuid');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const init = require('./passport');
const knex = require('../db/connection');
const authHelpers = require('./_helpers');

const options = {};

passport.use(new LocalStrategy(options, (username, password, done) => {
  // check to see if the username exists
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

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'photos', 'emails', 'gender', 'profileUrl']
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('fb Strategy');
    knex('users').where({ fb_id: profile.id }).first()
    .then((user) => {
      console.log('user:', user);
      if (!user) {
        console.log('there was no user');
        return knex('users')
        .insert({
          id: uuid.v1(),
          admin: false,
          username: profile.displayName,
          email: profile.emails[0].value,
          fb_id:  profile.id,
          familyName: profile.name.familyName,
          givenName: profile.name.givenName,
          gender: profile.gender,
          provider: profile.provider,
          profileUrl: profile.profileUrl,
          password: '123'
        })
        .returning('*').then(() => {
          return done(null, false);
        });
      } else {
        console.log('there was a user!', user);
        knex('users').where({ fb_id: profile.id }).first().update({
          username: profile.displayName,
          email: profile.emails[0].value,
          familyName: profile.name.familyName,
          givenName: profile.name.givenName,
          updatedAt: knex.fn.now()
        }).then((user) => {
          console.log('user updated:', user);
          return done(null, false);
        });
      }
    });
  }
));

module.exports = passport;
