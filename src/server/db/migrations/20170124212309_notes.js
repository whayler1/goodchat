
exports.up = function(knex, Promise) {
  return knex.schema.table('notes', (table) => {
    table.uuid('meeting_id').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('notes');
};
