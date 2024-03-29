(function (routeConfig) {

  'use strict';

  routeConfig.init = function (app) {

    // *** routes *** //
    const routes = require('../routes/index');
    const login = require('../routes/login');
    const authRoutes = require('../routes/auth');
    const userRoutes = require('../routes/user');
    const organizationRoutes = require('../routes/organization');
    const teamRoutes = require('../routes/team');
    const inviteRoutes = require('../routes/invite');
    const meetingRoutes = require('../routes/meeting');
    const noteRoutes = require('../routes/notes');
    const todosRoutes = require('../routes/todos');

    // *** register routes *** //
    app.use('/', routes);
    app.use('/', login);
    app.use('/auth', authRoutes);
    app.use('/', userRoutes);
    app.use('/', organizationRoutes);
    app.use('/', teamRoutes);
    app.use('/', inviteRoutes);
    app.use('/', meetingRoutes);
    app.use('/', noteRoutes);
    app.use('/', todosRoutes);
  };

})(module.exports);
