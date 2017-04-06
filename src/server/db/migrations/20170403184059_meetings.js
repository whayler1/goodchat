
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', (table) => {
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
