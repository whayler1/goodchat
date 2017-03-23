
exports.up = function(knex, Promise) {
  return knex.schema.table('notes', (table) => {
    table.string('note', 1500);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('notes');
};
