(function (routeConfig) {

  'use strict';

  routeConfig.init = function (app) {

    // *** routes *** //
    const routes = require('../routes/index');
    const login = require('../routes/login');
    const authRoutes = require('../routes/auth');
    const userRoutes = require('../routes/user');

    // *** register routes *** //
    app.use('/', routes);
    app.use('/', login);
    app.use('/auth', authRoutes);
    app.use('/', userRoutes);

  };

})(module.exports);
