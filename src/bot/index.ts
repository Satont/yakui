console.time('start')
import 'source-map-support/register'
import('reflect-metadata')
require('dotenv').config()
import { connected } from './libs/db'

const start = async () => {
  if (!connected) return setTimeout(() => start(), 1000)
  await import('./libs/tmi')
  await import('./panel')
}

start()
  .then(console.timeEnd('start'))


process.on('unhandledRejection', (reason) => {
  console.error(reason)
})