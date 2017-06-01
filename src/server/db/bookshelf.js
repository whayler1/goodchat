'use strict'

const knex = require('knex')(require('../../../knexfile.js')[process.env.NODE_ENV])
const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('registry'); // Resolve circular dependencies with relations

module.exports = bookshelf;
