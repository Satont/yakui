let path = '.env'
switch (process.env.NODE_ENV) {
  case 'development': path = '.env.dev'; break
}
require('dotenv').config({ path: path })

const connection = process.env.DATABASE_URL && process.env.DATABASE_URL !== '' ? process.env.DATABASE_URL : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false
   }

const config = {
    client: 'postgresql',
    connection,
    pool: {
      min: 2,
      max: 5,
      propagateCreateError: false,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
 }

module.exports = {
  development: config,
  production: config,
}
