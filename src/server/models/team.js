'use strict';

let Bookshelf = require('../db/bookshelf');

require('./membership')
var Team = Bookshelf.Model.extend({
  tableName: 'teams',
  hasTimestamps: true,

  memberships: function() {
    return this.hasMany('Membership');
  }
});

module.exports = Bookshelf.model('Team', Team);
