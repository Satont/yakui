import { Request, Response } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

import { System } from '@src/typings'
import tmi from '@bot/libs/tmi'
import { error } from '@bot/libs/logger'
import { Settings } from '@bot/entities/Settings'
import { orm } from '@bot/libs/db'

const accessTokenExpirationTime = 1 * 24 * 60 * 60 // 1 day
const refreshTokenExpirationTime = 31 * 24 * 60 * 60 // 31 day

export default new class Authorization implements System {
  JWTKey: string

  async init() {
    let key = await orm.em.getRepository(Settings).findOne({ space: 'general', name: 'JWTKey' })
    if (!key) {
      const value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      key = orm.em.getRepository(Settings).create({ space: 'general', name: 'JWTKey', value })
      await orm.em.persistAndFlush(key)
    }

    this.JWTKey = key.value
  }

  async validate(req: Request, res: Response) {
    const accessTokenHeader = req.headers['x-twitch-token'] as string | undefined
    const userId = req.headers['x-twitch-userid'] as string | undefined

    try {

      if (!accessTokenHeader || !userId) {
        throw new Error('Insufficient data')
      }

      const twitchValidation = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
          'Authorization': 'OAuth ' + accessTokenHeader,
        },
      })

      if (userId !== twitchValidation.data.user_id) {
        throw new Error('Not matching userId')
      }
      const username = twitchValidation.data.login
      const admins: string[] = [tmi?.channel?.name]
      const botAdmins: Settings = await orm.em.getRepository(Settings).findOne({ space: 'users', name: 'botAdmins' } )
      if (botAdmins) admins.push(...botAdmins.value)

      const userType = (!tmi.channel?.name || !admins.length ? true : admins.includes(username)) ? 'admin' : 'viewer'

      const accessToken = jwt.sign({
        userId,
        username,
        privileges: userType,
      }, this.JWTKey, { expiresIn: `${accessTokenExpirationTime}s` })
      const refreshToken = jwt.sign({
        userId,
        username,
      }, this.JWTKey, { expiresIn: `${refreshTokenExpirationTime}s` })
      res.status(200).send({ accessToken, refreshToken, userType })
    } catch(e) {
      console.error(e)
      res.status(400).send('You have no access to view that.')
    }
  }

  async refresh(req: Request, res: Response) {
    const refreshTokenFromHeader = req.headers['x-twitch-token'] as string | undefined

    try {
      if (!refreshTokenFromHeader) throw new Error('No refresh token')

      const data = jwt.verify(refreshTokenFromHeader, this.JWTKey) as { userId: number, username: string }

      const admins: string[] = [tmi?.channel?.name]
      const botAdmins: Settings = await orm.em.getRepository(Settings).findOne({ space: 'users', name: 'botAdmins' } )
      if (botAdmins) admins.push(...botAdmins.value)

      const userType = (!tmi.channel?.name || !admins.length ? true : admins.includes(data.username)) ? 'admin' : 'viewer'

      const accessToken = jwt.sign({
        userId: data.userId,
        username: data.username,
        privileges: userType,
      }, this.JWTKey, { expiresIn: `${accessTokenExpirationTime}s` })
      const refreshToken = jwt.sign({
        userId: data.userId,
        username: data.username,
      }, this.JWTKey, { expiresIn: `${refreshTokenExpirationTime}s` })

      res.status(200).send({ accessToken, refreshToken, userType })
    } catch (e) {
      error(e)
      res.status(400).send('You have no access to view that.')
    }
  }

  verify(token: string) {
    return jwt.verify(token, this.JWTKey)
  }
}
