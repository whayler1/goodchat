'use strict';

let Bookshelf = require('../db/bookshelf');

require('./user')
require('./team')
var Membership = Bookshelf.Model.extend({
  tableName: 'memberships',
  hasTimestamps: true,

  user: function() {
    return this.belongsTo('User');
  },
  team: function() {
    return this.belongsTo('Team')
  }
});

module.exports = Bookshelf.model('Membership', Membership);
