
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', (table) => {
    table.text('title');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
