const knex = require('knex')({
  client: 'pg',
  connection:  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    ssl: true
  },
  //debug: true,
  pool: {
    afterCreate: function (conn, done) {
      console.log('Connected to db')
      knex.connected = true
      done(null, conn)
    }
  },
  postProcessResponse: (result, queryContext) => {
    if (Array.isArray(result) && result.length < 2) {
      //return result[0]
      return result
    } else return result
  }
})


async function test() {
  let test = await knex('systems.moderation').where({name: 'color'})
}
test()
module.exports = knex