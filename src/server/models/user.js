'use strict';

let Bookshelf = require('../db/bookshelf');

require('./membership')
var User = Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  memberships: function() {
    return this.hasMany('Membership');
  }
});

module.exports = Bookshelf.model('User', User);
