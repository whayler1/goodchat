
exports.up = function(knex, Promise) {
  return knex.schema.table('teams', (table) => {
    table.dropColumn('user_ids');
    table.dropColumn('admin_ids');
    table.dropColumn('owner');
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
