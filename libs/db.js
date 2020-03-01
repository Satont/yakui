const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? true : false
  },
  // debug: true,
  pool: {
    min: 0,
    max: 10,
    afterCreate: function (conn, done) {
      console.log('Pool created')
      knex.connected = true
      done(null, conn)
    }
  }
})

// we need this workround for test connection
async function connect () {
  await knex.raw('SELECT VERSION()')
  await global.db('core.subscribers').where('name', 'latestSubscriber').update('value', 'username')
}
connect()
module.exports = knex
