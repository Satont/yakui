import axios, { AxiosError } from 'axios'
import {Settings} from '@bot/entities/Settings'
import { info, error } from './logger'
import { orm } from './db'

export default new class Oauth {
  async validate (token: string | null, type: 'bot' | 'broadcaster') {
    if (!token) {
      throw `Token for ${type} was not provided, starting updating`
    }

    try {
      const { data } = await axios.get('https://id.twitch.tv/oauth2/validate', { headers: {
        'Authorization': `OAuth ${token}`,
      }})

      return {
        clientId: data.client_id,
        login: data.login,
        userId: data.user_id,
        scopes: data.scopes,
      }
    } catch (e) {
      error((e as AxiosError).response.data ? e.response.data : e)
      throw `Can't validate access token of ${type}`
    }
  }

  async refresh(token: string, type: 'bot' | 'broadcaster') {
    try {
      const { data } = await axios.get('http://bot.satont.ru/api/refresh?refresh_token=' + token)
      let accessToken = await orm.em.getRepository(Settings).findOne({ space: 'oauth', name: `${type}AccessToken` })
      if (!accessToken) {
        accessToken = orm.em.getRepository(Settings).create({ space: 'oauth', name: `${type}AccessToken`, value: data.token })
      }
      
      let refreshToken = await orm.em.getRepository(Settings).findOne({ space: 'oauth', name: `${type}RefreshToken` })
      if (!refreshToken) {
        refreshToken = orm.em.getRepository(Settings).create({ space: 'oauth', name: `${type}RefreshToken`, value: data.token })
      }
    
      accessToken.value = data.token
      refreshToken.value = data.refresh

      await orm.em.persistAndFlush([accessToken, refreshToken])
      info(`Access token of ${type} was refreshed.`)
      return {
        access_token: data.token,
        refresh_token: data.refresh,
      }
    } catch (e) {
      error((e as AxiosError).response?.data ? e.response.data : e)
      throw `Can't refresh access token of ${type}`
    }
  }
}