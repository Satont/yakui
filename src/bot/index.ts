import './moduleAlias'
import 'reflect-metadata'
import 'source-map-support/register'
console.time('start')

require('dotenv').config()
import { connected } from '@bot/libs/db'
import { error } from '@bot/libs/logger'
import { inspect } from 'util'

const start = async () => {
  if (!connected) return setTimeout(() => start(), 1000)
  await import('@bot/libs/locales')
  await import('@bot/libs/tmi')
  await import('@bot/panel')
}

start()

process.on('unhandledRejection', (reason) => {
  error(`${inspect(reason)}`)
})