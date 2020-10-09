import axios, { AxiosError } from 'axios'
import { info, error } from './logger'
import { onChange, settings } from '../decorators'
import tmi from './tmi'


class OAuth {
  @settings()
  botAccessToken: string = null

  @settings()
  botRefreshToken: string = null

  @settings()
  broadcasterAccessToken: string = null

  @settings()
  broadcasterRefreshToken: string = null

  @onChange(['botAccessToken', 'botRefreshToken', 'broadcasterAccessToken', 'broadcasterRefreshToken'])
  callOtherSystems() {
    tmi.init()
  }

  async validate (token: string | null, type: 'bot' | 'broadcaster') {
    if (!token) {
      throw `Token for ${type} was not provided, starting updating`
    }

    try {
      const { data } = await axios.get('https://id.twitch.tv/oauth2/validate', { headers: {
        'Authorization': `OAuth ${token}`,
      } })

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

      this[`${type}accessToken`] = data.token
      this[`${type}RefreshToken`]  = data.refresh

      info(`Access token of ${type} was refreshed.`)
      return {
        access_token: data.token,
        refresh_token: data.refresh,
      }
    } catch (e) {
      error(e)
      throw `Can't refresh access token of ${type}`
    }
  }
}

export default new OAuth()
