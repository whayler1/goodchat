# Goodchat

Some sort of management tool I am working on with @thechrisfischer

server forked from [node passport postgres](http://mherman.org/blog/2016/09/25/node-passport-and-postgres/#.V-gocpMrJE4).

## dependencies

- node
- yarn
- knex
- webpack
- postgres

## Want to use this project?

1. Fork/Clone
1. Install dependencies - `npm install -g yarn knex webpack`
1. Add a *.env* file
1. Create two local Postgres databases - `goodchat`
1. Migrate - `knex migrate:latest --env development`
1. Seed - `knex seed:run --env development`
1. Run the development server - `gulp`
1. Run webpack `webpack`
1. Test - `npm test`
