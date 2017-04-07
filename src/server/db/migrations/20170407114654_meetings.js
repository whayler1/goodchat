
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', function(t) {
    t.text('title');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
