import './moduleAlias'
import 'reflect-metadata'
import 'source-map-support/register'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
import { connected } from '@bot/libs/db'
import { error } from '@bot/libs/logger'

const start = async () => {
  if (!connected) return setTimeout(() => start(), 1000)
  await import('@bot/libs/locales')
  await import('@bot/libs/tmi')
  await import('@bot/panel')
  await import('@bot/libs/socket')
}

start()

process.on('unhandledRejection', (reason) => error(reason))
process.on('uncaughtException', (err: Error) => {
  const date = new Date().toISOString()

  process.report?.writeReport(`uncaughtException-${date}`, err)
  error(err)

  process.exit(1)
})