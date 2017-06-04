exports.up = (knex, Promise) => {
  return knex.schema.table('meetings', (table) => {
    table.boolean('is_invite_sent').notNullable().defaultTo(false);
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('meetings');
};
