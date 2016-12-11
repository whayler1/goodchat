const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');

router.get('/', function (req, res, next) {
  const renderObject = {};
  // require("../../../src/client/js/main.less")
  renderObject.title = 'Welcome to Express!';
  indexController.sum(1, 2, (error, results) => {
    if (error) return next(error);
    if (results) {
      renderObject.sum = results;
      renderObject.googleClientId = process.env.GOOGLE_CLIENT_ID;
      res.render('index', renderObject);
    }
  });
});

module.exports = router;
