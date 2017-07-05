
exports.up = (knex, Promise) => {
  return knex.schema.table('meetings', function(t) {
    t.text('google_calendar_event_id');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('meetings');
};
