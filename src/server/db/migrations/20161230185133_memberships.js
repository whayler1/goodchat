
exports.up = function(knex, Promise) {
  return knex.schema.createTable('memberships', (table) => {
    table.uuid('user_id').notNullable();
    table.uuid('team_id').notNullable();
    table.boolean('is_admin').notNullable().defaultTo(false);
    table.boolean('is_owner').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('memberships');
};
