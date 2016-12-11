exports.seed = (knex, Promise) => {
  return knex('users').del()
  .then(() => {
    return Promise.join(
      knex('users').insert({
        email: 'hillary@trump.gov',
        family_name: 'Trump',
        given_name: 'Hillary',
        google_id: '123123'
      })
    );
  })
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync('bryant123', salt);
    return Promise.join(
      knex('users').insert({
        email: 'rsarkis@trump.gov',
        family_name: 'Sarkis',
        given_name: 'Richard',
        google_id: '0987654321',
        admin: true
      })
    );
  });
};
