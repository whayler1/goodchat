
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', (table) => {
    table.boolean('are_answers_ready').defaultTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
