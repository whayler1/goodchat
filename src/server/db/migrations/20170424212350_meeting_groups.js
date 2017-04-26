const uuid = require('node-uuid');

exports.up = (knex, Promise) => {
  return new Promise((resolve, reject) => {
    knex.schema.createTable('meeting_groups', (table) => {
      table.uuid('id').unique().notNullable();
      table.uuid('team_id').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    }).then(() => knex.schema.createTable('meeting_group_memberships', (table) => {
      table.uuid('id').unique().notNullable();
      table.uuid('meeting_group_id').unique().notNullable();
      table.uuid('user_id').unique().notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    })).then(() => knex.select('*').from('teams').then(teams => {
      const teamPromises = teams.map(team => new Promise(teamResolve => {
        knex('memberships').select([
          'users.id',
          'users.given_name',
          'users.family_name',
          'users.email',
          'users.picture',
          'memberships.is_owner',
          'memberships.is_admin'])
        .join('users', { 'memberships.user_id': 'users.id'})
        .where({ team_id: team.id })
        .then(members => {
          const pairs = [];

          // JW: Generate every combination of pairs
          members.forEach((member, index, ary) => {
            const subAry = ary.slice(index, ary.length)
            return subAry.forEach(subMember =>{
              if (item !== subMember) pairs.push([member, subMember]);
            });
          });

          const pairPromises = pairs.map(pair => new Promise(pairResolve => {
            const meeting_group_id = uuid.v1();

            knex('meeting_groups').insert({
              id: meeting_group_id,
              team_id: team.id
            }).then(() => {
              const promises = pair.map(member => knex('meeting_group_memberships').insert({ id: uuid.v1(), meeting_group_id, user_id: member.id }));
              Promise.all(promises).then(() => pairResolve());
            });
          }));

          Promise.all(pairPromises).then(() => teamResolve());
        });
      }));

      Promises.all(teamPromises).then(() => resolve());
    }));
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('meeting_groups');
};
