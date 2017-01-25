exports.up = (knex, Promise) => {
  return knex.schema.createTable('notes', (table) => {
    table.uuid('id').notNullable().unique();
    table.uuid('user_id').notNullable();
    table.string('note');
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('notes');
};
