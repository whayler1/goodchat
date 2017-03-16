
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', (table) => {
    table.timestamp('finished_at');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
