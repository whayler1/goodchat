
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('meetings', function(t) {
    t.text('answer5', 35).alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
