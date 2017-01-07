
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('picture');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
