
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('notes', function(t) {
    t.text('note').alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('notes');
};
