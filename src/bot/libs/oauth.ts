import axios, { AxiosError } from 'axios'
import { info, error } from './logger'
import { onChange, settings } from '../decorators'
import tmi from './tmi'

class OAuth {
  @settings()
  channel: string = null

  @settings()
  botAccessToken: string = null

  @settings()
  botRefreshToken: string = null

  @settings()
  broadcasterAccessToken: string = null

  @settings()
  broadcasterRefreshToken: string = null

  @onChange('channel')
  callTmi() {
    tmi.connect('bot')
    tmi.connect('broadcaster')
  }

  @onChange(['botAccessToken', 'botRefreshToken'])
  callBotConnect() {
    tmi.connect('bot')
  }

  @onChange(['broadcasterAccessToken', 'broadcasterRefreshToken'])
  callBroadcasterConnect() {
    tmi.connect('broadcaster')
  }

  async validate(type: 'bot' | 'broadcaster'): Promise<{
    clientId: string,
    login: string,
    userId: string,
    scopes: string[]
  }> {
    try {
      const { data } = await axios.get('https://id.twitch.tv/oauth2/validate', { headers: {
        'Authorization': `OAuth ${this[`${type}AccessToken`]}`,
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

  async refresh(type: 'bot' | 'broadcaster'): Promise<{
    access_token: string,
    refresh_token: string,
  }> {
    try {
      const { data } = await axios.get('http://bot.satont.ru/api/refresh?refresh_token=' + this[`${type}RefreshToken`])

      this[`${type}AccessToken`] = data.token
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
