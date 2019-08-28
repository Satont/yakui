const winston = require('winston')
const format = winston.format
const printf = format.printf
const combine = format.combine
const moment = require('moment-timezone')
const logDir = './logs'
const fs = require('fs')
const { inspect } = require('util')

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

global.log = winston.createLogger({
  json: false,
  levels: { info: 1, chatIn: 1, chatOut: 1, error: 1 },
  format: combine(
    printf(info => {
      let level
      if (info.level === 'info') level = '!!!'
      if (info.level === 'chatIn') level = '>>>'
      if (info.level === 'chatOut') level = '<<<'
      if (info.level === 'error') level = '!!! ERROR !!!'
      if (info.level === 'sub') level = '+sub'
      if (info.level === 'resub') level = '+resub'
      if (info.level === 'subgift') level = '+subgift'
      if (info.level === 'bits') level = '+cheer'
      if (info.level === 'hosted') level = '+hosted'
      if (info.level === 'raided') level = '+raided'
      let timestamp = moment().tz('Europe/Moscow').format('YYYY-MM-DD[T]HH:mm:ss.SSS')
      if (typeof info.message === 'object') info.message = JSON.stringify(info.message, null, 4)
      return `${timestamp} ${level} ${info.message}`
    })
  ),
  exceptionHandlers: [
    new winston.transports.File({ filename: logDir + '/exceptions.log', colorize: false, maxsize: 5242880, maxFiles: 10, tailable: true }),
    new winston.transports.Console({ colorize: true })
  ],
  transports: [
    new winston.transports.File({ filename: logDir + '/bot.log', colorize: false, maxsize: 5242880, maxFiles: 10, tailable: true }),
    new winston.transports.Console({ colorize: true })
  ]
})
