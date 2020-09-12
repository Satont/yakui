import winston from 'winston'
import moment from 'moment'
import fs from 'fs'
import chalk from 'chalk'
import { inspect } from 'util'

const { format } = winston
const { combine, printf } = format;

declare module 'winston' {
  export interface Logger {
    chatIn: winston.LeveledLogMethod;
    chatOut: winston.LeveledLogMethod;
    whisperOut: winston.LeveledLogMethod;
    sub: winston.LeveledLogMethod;
    resub: winston.LeveledLogMethod;
    subgift: winston.LeveledLogMethod;
    bits: winston.LeveledLogMethod;
    hosted: winston.LeveledLogMethod;
    raided: winston.LeveledLogMethod;
    hosting: winston.LeveledLogMethod;
    donate: winston.LeveledLogMethod;
    timeout: winston.LeveledLogMethod;
    moded: winston.LeveledLogMethod;
    unmoded: winston.LeveledLogMethod;
    follow: winston.LeveledLogMethod;
    unfollow: winston.LeveledLogMethod;
    redemption: winston.LeveledLogMethod;
  }
}
const levels: winston.config.AbstractConfigSetLevels = {
  info: 1,
  chatIn: 1,
  chatOut: 1,
  whisperOut: 1,
  error: 1,
  sub: 1,
  resub: 1,
  subgift: 1,
  bits: 1,
  hosted: 1,
  raided: 1,
  donate: 1,
  hosting: 1,
  timeout: 1,
  moded: 1,
  unmoded: 1,
  follow: 1,
  unfollow: 1,
  redemption: 1,
}

const logDir = './logs'

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

const log = winston.createLogger({
  levels,
  format: combine(
    printf(info => {
      let level: string
      if (info.level === 'info') level = chalk.magenta('!!!')
      if (info.level === 'chatIn') level = chalk.cyan('>>>')
      if (info.level === 'chatOut') level = chalk.cyan('<<<')
      if (info.level === 'whisperOut') level = chalk.cyan('<<< whispers')
      if (info.level === 'error') level = chalk.red('!!! ERROR !!!')
      if (info.level === 'sub') level = chalk.cyanBright('+sub')
      if (info.level === 'resub') level = chalk.cyanBright('+resub')
      if (info.level === 'subgift') level = chalk.cyanBright('+subgift')
      if (info.level === 'bits') level = chalk.cyanBright('+cheer')
      if (info.level === 'hosted') level = chalk.cyanBright('+hosted')
      if (info.level === 'raided') level = chalk.cyanBright('+raided')
      if (info.level === 'hosting') level = chalk.cyanBright('?hosting')
      if (info.level === 'timeout') level = chalk.cyanBright('+timeout')
      if (info.level === 'donate') level = chalk.cyanBright('+donate')
      if (info.level === 'moded') level = chalk.cyanBright('+moderator')
      if (info.level === 'unmoded') level = chalk.cyanBright('-moderator')
      if (info.level === 'follow') level = chalk.cyanBright('+follow')
      if (info.level === 'unfollow') level = chalk.cyanBright('-follow')
      if (info.level === 'redemption') level = chalk.cyanBright(`/redemption/`)

      if (typeof info.message === 'object') info.message = inspect(info.message)
      const timestamp = moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')

      return `${timestamp} ${level} ${info.message}`
    }),
  ),
  exceptionHandlers: [
    new winston.transports.File({
      filename: logDir + '/exceptions.log',
      maxsize: 5242880,
      maxFiles: 10,
      tailable: true,
    }),
    new winston.transports.Console()
  ],
  transports: [
    new winston.transports.File({
      filename: logDir + '/bot.log',
      maxsize: 5242880,
      maxFiles: 10,
      tailable: true,
      format: printf(info => {
        if (typeof info.message === 'object') info.message = inspect(info.message)
        const timestamp = moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')

        return `${timestamp} ${info.level}: ${info.message}`
      })
    }),
    new winston.transports.Console()
  ]
})

export const info = log.info.bind(log)
export const error = log.error.bind(log)
export const whisperOut = log.whisperOut.bind(log)
export const chatIn = log.chatIn.bind(log)
export const chatOut = log.chatOut.bind(log)
export const sub = log.sub.bind(log)
export const resub = log.resub.bind(log)
export const subgift = log.subgift.bind(log)
export const bits = log.bits.bind(log)
export const hosted = log.hosted.bind(log)
export const hosting = log.hosting.bind(log)
export const donate = log.donate.bind(log)
export const timeout = log.timeout.bind(log)
export const raided = log.raided.bind(log)
export const moded = log.moded.bind(log)
export const unmoded = log.unmoded.bind(log)
export const follow = log.follow.bind(log)
export const unfollow = log.unfollow.bind(log)
export const redemption = log.redemption.bind(log)
