console.time('start')
import 'source-map-support/register'
import('reflect-metadata')
require('dotenv').config()
import { connected } from './libs/db'
import { error } from './libs/logger'
import { inspect } from 'util'

const start = async () => {
  if (!connected) return setTimeout(() => start(), 1000)
  await import('./libs/locales')
  await import('./libs/tmi')
  await import('./panel')
}

start()
  .then(console.timeEnd('start'))

process.on('unhandledRejection', (reason) => {
  error(`${inspect(reason)}`)
})