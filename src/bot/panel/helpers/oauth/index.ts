import { Request, Response } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

import tmi from '@bot/libs/tmi'
import { error } from '@bot/libs/logger'
import Settings from '@bot/models/Settings'

const JWTKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
const accessTokenExpirationTime = 1 * 24 * 60 * 60 // 1 day
const refreshTokenExpirationTime = 31 * 24 * 60 * 60 // 31 day

export const validate = async (req: Request, res: Response) => {
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
    const admins: string[] = [tmi.channel.name]
    const botAdmins: Settings = await Settings.findOne({ where: { space: 'users', name: 'botAdmins' } })
    if (botAdmins) admins.push(...botAdmins.value)

    const haveCasterPermission = admins.includes(username)

    const accessToken = jwt.sign({
      userId,
      username,
      privileges: haveCasterPermission ? 'admin': 'viewer',
    }, JWTKey, { expiresIn: `${accessTokenExpirationTime}s` })
    const refreshToken = jwt.sign({
      userId,
      username,
    }, JWTKey, { expiresIn: `${refreshTokenExpirationTime}s` })
    res.status(200).send({ accessToken, refreshToken, userType: haveCasterPermission ? 'admin' : 'viewer'})
  } catch(e) {
    error(e)
    res.status(400).send('You have no access to view that.')
  }
}

export const refresh = async (req: Request, res: Response) => {
  const refreshTokenFromHeader = req.headers['x-twitch-token'] as string | undefined

  try {
    if (!refreshTokenFromHeader) throw new Error('No refresh token')

    const data = jwt.verify(refreshTokenFromHeader, JWTKey) as { userId: number, username: string }

    const admins: string[] = [tmi.channel.name]
    const botAdmins: Settings = await Settings.findOne({ where: { space: 'users', name: 'botAdmins' } })
    if (botAdmins) admins.push(...botAdmins.value)

    const haveCasterPermission = admins.includes(data.username)

    const accessToken = jwt.sign({
        userId: data.userId,
        username: data.username,
        privileges: haveCasterPermission ? 'admin': 'viewer',
      }, JWTKey, { expiresIn: `${accessTokenExpirationTime}s` })
    const refreshToken = jwt.sign({
      userId: data.userId,
      username: data.username,
    }, JWTKey, { expiresIn: `${refreshTokenExpirationTime}s` })

    res.status(200).send({ accessToken, refreshToken, userType: haveCasterPermission ? 'admin' : 'viewer'})
  } catch (e) {
    error(e)
    res.status(400).send('You have no access to view that.')
  }
}
