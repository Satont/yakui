import pg from 'pg'
import { MikroORM } from '@mikro-orm/core'

pg.defaults.parseInt8 = true

import { Sequelize } from 'sequelize-typescript'
import { resolve } from 'path'
import { info, error } from './logger'

export let connected = false

export const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [resolve(__dirname, '..', 'models')],
  logging: false,
})

sequelize.authenticate()
  .then(() => info('Connected to DB'))
  .then(() => connected = true)
  .catch((e) => {
    error(`Can't connect to db ${e}`)
    process.exit(1)
  })

export let orm: MikroORM
export const start = async () => {
  orm = await MikroORM.init({
    dbName: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    type: 'postgresql',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities: ['./dest/entities'],
    entitiesTs: ['./src/bot/entities'],
  })
}

start()
