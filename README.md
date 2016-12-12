# Goodchat

Some sort of management tool I am working on with @thechrisfischer

server forked from [node passport postgres](http://mherman.org/blog/2016/09/25/node-passport-and-postgres/#.V-gocpMrJE4).

## dependencies

- node
- yarn
- knex
- webpack
- postgres

## Getting started

1. Install cli dependencies - `npm install -g yarn knex webpack`
1. Install yarn dependencies - `yarn`
1. Add requied *.env* file
1. Create a Postgres databases - `goodchat`
1. Migrate - `knex migrate:latest --env development`
1. Run the server - `yarn start`
1. Go to http://localhost:3000
