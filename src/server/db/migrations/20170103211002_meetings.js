
exports.up = function(knex, Promise) {
  return knex.schema.createTable('meetings', (table) => {
    table.uuid('id').unique().notNullable();
    table.uuid('team_id').notNullable();
    table.uuid('user_id').notNullable();
    table.string('question1');
    table.string('question2');
    table.string('question3');
    table.string('question4');
    table.string('question5');
    table.string('answer1');
    table.string('answer2');
    table.string('answer3');
    table.string('answer4');
    table.string('answer5');
    table.boolean('is_done').notNullable().defaultTo(false);
    table.timestamp('meeting_date');
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('meetings');
};
