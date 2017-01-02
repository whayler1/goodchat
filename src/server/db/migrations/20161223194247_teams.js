
exports.up = function(knex, Promise) {
  return knex.schema.table('teams', (table) => {
    table.specificType('admin_ids', 'text[]');
    table.string('owner').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
