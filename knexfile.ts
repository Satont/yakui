import { Config } from 'knex'
require('dotenv').config()

const connection = process.env.DATABASE_URL && process.env.DATABASE_URL !== '' 
  ? process.env.DATABASE_URL 
  : { 
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false,
  }

const config: Config = {
  client: 'pg',
  connection,
  migrations: {
    extension: 'ts',
    directory: 'src/data/migrations',
    tableName: 'migrations',
  }
}

export const production = config
export const development = config