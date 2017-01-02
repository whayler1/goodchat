const uuid = require('node-uuid');

exports.up = function(knex, Promise) {
  return knex.schema.createTable('organizations', (table) => {
    table.uuid('id').unique().notNullable().defaultTo(uuid.v1());
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.string('name');
    table.specificType('team_ids', 'text[]');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('organizations');
};
