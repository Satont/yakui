const fs = require('fs')
const dotenv = require('dotenv')
if (process.env.NODE_ENV === 'development') {
  const development = dotenv.parse(fs.readFileSync('.env.dev'))
  for (let k in development) {
    process.env[k] = development[k]
  }
} else dotenv.config()

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,
      ssl: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,
      ssl: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

}
