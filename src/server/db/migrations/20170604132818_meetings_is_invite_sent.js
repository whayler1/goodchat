exports.up = (knex, Promise) => {
  return new Promise((resolve, reject) => {
    knex.schema.table('meetings', (table) => {
      table.boolean('is_invite_sent').notNullable().defaultTo(false);
    }).then(
      () => knex('meetings').where({ is_done: false }).update({ is_invite_sent: true })
      .then(() => resolve())
    );
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('meetings');
};
