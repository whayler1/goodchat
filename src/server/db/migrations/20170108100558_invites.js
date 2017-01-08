
exports.up = function(knex, Promise) {
  return knex.schema.table('invites', (table) => {
    table.boolean('is_admin').defaultTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('invites');
};
