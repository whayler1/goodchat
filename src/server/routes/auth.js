const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

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

router.post('/login/google', authHelpers.loginRedirect, (req, res, next) => {
  const { email, family_name, given_name, google_id } = req.body;
  console.log('new login:', req.user);
  const user = knex('users').where({ google_id }).first();

  user.then(userObj => {
    console.log('--userObj', userObj);
    if (!userObj) {
      console.log('no user obj-');
      knex('users')
      .insert({
        email,
        family_name,
        given_name,
        google_id
      })
      .returning('*')
      .then((userres) => {
        console.log('the insertion happened', userres);
        handleLogin(res, useres[0]);
      })
      .then(() => { handleResponse(res, 200, 'success'); })
      .catch((err) => { handleResponse(res, 500, 'error'); });
    } else {
      passport.authenticate('local', (err, user, info) => {
        console.log('passport auth cb', err);
        console.log('passport auth user', user);
        console.log('passport auth info', info);
        if (err) { handleResponse(res, 500, 'error'); }
        if (!user) { handleResponse(res, 404, 'User not found'); }
        if (user) { handleResponse(res, 200, 'success'); }
      })(req, res, next);
      // user.update({ updated_at: knex.fn.now() })
      // .returning('*')
      // .then((user) => {
      //   console.log('updated', user);
      //   handleResponse(res, 200, 'user updated');
      // });
    }
  });
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
