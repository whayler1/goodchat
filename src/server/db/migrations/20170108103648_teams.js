
exports.up = function(knex, Promise) {
  return knex.schema.table('teams', (table) => {
    table.string('question1');
    table.string('question2');
    table.string('question3');
    table.string('question4');
    table.string('question5');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
