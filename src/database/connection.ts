const config = require('./knexfile')
const knex = require('knex')

const connection = knex(config)

export default connection
