
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('provider');
    table.string('profileUrl');
    table.string('gender');
    table.string('fb_id');
  });
};

exports.down = function(knex, Promise) {

};
