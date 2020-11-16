import { Request, Response } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

import tmi from '@bot/libs/tmi'
import { error } from '@bot/libs/logger'
import { settings } from '../decorators'
import users from './users'

const accessTokenExpirationTime = 1 * 24 * 60 * 60 // 1 day
const refreshTokenExpirationTime = 31 * 24 * 60 * 60 // 31 day

class Authorization {
  @settings()
  JWTKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  async validate(req: Request, res: Response) {
    const accessTokenHeader = req.headers['x-twitch-token'] as string | undefined
    const userId = req.headers['x-twitch-userid'] as string | undefined

    try {
      if (!accessTokenHeader || !userId) {
        throw new Error('Insufficient data')
      }

      const { data: twitchValidation } = await axios.get<{
        client_id: string,
        login: string,
        scopes: string[]
        user_id: string,
      }>(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
          'Authorization': 'OAuth ' + accessTokenHeader,
        },
      })

      if (userId !== twitchValidation.user_id) {
        throw new Error('Not matching userId')
      }
      const username = twitchValidation.login
      const admins: string[] = [tmi?.channel?.name]
      const botAdmins = users.botAdmins
      if (botAdmins) admins.push(...botAdmins)

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
      const botAdmins = users.botAdmins
      if (botAdmins) admins.push(...botAdmins)

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

export default new Authorization()
