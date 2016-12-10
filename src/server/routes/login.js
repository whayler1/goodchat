const express = require('express');
const router = express.Router();

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.get('/forgot-password', function (req, res, next) {
  res.render('forgot-password');
});

module.exports = router;
