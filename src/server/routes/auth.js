const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

passport.serializeUser((user, done) => {
  console.log('\n\n serializeUser', user);
  done(null, user.google_id);
});

passport.deserializeUser((google_id, done) => {
  console.log('\n\n deserializeUser');
  // done(null, user);
  knex('users').where({google_id}).first()
  .then((user) => { done(null, user); })
  .catch((err) => { done(err, null); });
});

router.post('/register', authHelpers.loginRedirect, (req, res, next)  => {
  return authHelpers.createUser(req, res)
  .then((user) => {
    handleLogin(res, user[0]);
  })
  .then(() => { handleResponse(res, 200, 'success'); })
  .catch((err) => { handleResponse(res, 500, 'error'); });
});

router.post('/login', authHelpers.loginRedirect, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { handleResponse(res, 500, 'error'); }
    if (!user) { handleResponse(res, 404, 'User not found'); }
    if (user) { handleResponse(res, 200, 'success'); }
  })(req, res, next);
});

router.post('/google', (req, res, next) => {
  console.log('\n\ngoogle endpoint <-', req.user);
  passport.authenticate('google-signin', (err, user, info) => {
    console.log('\n\nauth cb:', user, '\n err', err);
    req.login(user, (err) => {
      if (err) {
        console.log('\n-----login err:', err);
      }
      res.json(user);
    });
  })(req, res, next);
});

router.get('/logout', authHelpers.loginRequired, (req, res, next) => {
  req.logout();
  handleResponse(res, 200, 'success');
});

// *** helpers *** //

function handleLogin(req, user) {
  return new Promise((resolve, reject) => {
    req.login(user, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function handleResponse(res, code, statusMsg) {
  res.status(code).json({status: statusMsg});
}

module.exports = router;
