exports.up = (knex, Promise) => {
  return knex.schema.table('users', (table) => {
    table.uuid('id').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('familyName');
    table.string('givenName');
    table.timestamp('updatesAt').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('users');
};
