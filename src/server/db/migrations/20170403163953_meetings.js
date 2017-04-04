
exports.up = function(knex, Promise) {
  return knex.schema.table('meetings', (table) => {
    table.integer('qa_length');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
