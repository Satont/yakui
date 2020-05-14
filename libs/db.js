const connection = process.env.DATABASE_URL && process.env.DATABASE_URL !== '' 
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false
   }

const knex = require('knex')({
  client: 'pg',
  connection,
  // debug: true,
  pool: {
    min: 0,
    max: 5,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    propagateCreateError: false,
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
