const uuid = require('node-uuid');

exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.uuid('id').unique().notNullable().defaultTo(uuid.v1());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
