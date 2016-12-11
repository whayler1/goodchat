exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', (table) => {
    table.string('email').unique().notNullable();
    table.string('family_name').notNullable();
    table.string('given_name').notNullable();
    table.string('google_id').unique().notNullable();
    table.boolean('admin').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('users');
};
