
exports.up = function(knex, Promise) {
  return knex.schema.table('notes', (table) => {
    table.dropColumn('note');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('notes');
};
