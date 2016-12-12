const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');

router.get('/', function (req, res, next) {
  const renderObject = {};
  renderObject.googleClientId = process.env.GOOGLE_CLIENT_ID;
  res.render('index', renderObject);
});

module.exports = router;
