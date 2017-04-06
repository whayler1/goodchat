
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('meetings', function(t) {
    t.text('question1').alter();
    t.text('question2').alter();
    t.text('question3').alter();
    t.text('question4').alter();
    t.text('question5').alter();
    t.text('answer1').alter();
    t.text('answer2').alter();
    t.text('answer3').alter();
    t.text('answer4').alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
