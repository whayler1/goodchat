
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('updatesAt');
    table.dropColumn('created_at');
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
  });
};

exports.down = function(knex, Promise) {

};
