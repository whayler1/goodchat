
exports.up = function(knex, Promise) {
  return knex.schema.createTable('invites', (table) => {
    table.uuid('id').unique().notNullable();
    table.uuid('team_id').notNullable();
    table.uuid('host_id').notNullable();
    table.string('invitee_email').notNullable();
    table.boolean('is_used').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('invites');
};
