
exports.up = function(knex, Promise) {
  return knex.schema.table('memberships', (table) => {
    table.uuid('id').unique().notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('memberships');
};
