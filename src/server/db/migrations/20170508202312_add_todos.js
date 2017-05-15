exports.up = (knex, Promise) => {
  return knex.schema.createTable('todos', (table) => {
    table.uuid('id').unique().notNullable();
    table.uuid('user_id').notNullable();
    table.uuid('meeting_id').notNullable();
    table.uuid('meeting_group_id').notNullable();
    table.text('text');
    table.boolean('is_done').notNullable().defaultTo(false);
    table.timestamps(true);
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('todos');
};
