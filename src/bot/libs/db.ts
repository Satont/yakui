import { Sequelize } from 'sequelize-typescript'
import { resolve } from 'path'

export let connected = false

const sequelize = new Sequelize({
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
  .then(() => console.info('Connected to DB'))
  .then(() => connected = true)
  .catch((e) => {
    console.error('Can\'t connect to db', e)
    process.exit(1)
  })
