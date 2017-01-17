
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', (table) => {
    table.uuid('host_id').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
