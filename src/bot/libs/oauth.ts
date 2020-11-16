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
  async callTmi() {
    await tmi.connect('bot')
    await tmi.connect('broadcaster')
  }

  @onChange(['botAccessToken', 'botRefreshToken'])
  callBotConnect() {
    tmi.connect('bot')
  }

  @onChange(['broadcasterAccessToken', 'broadcasterRefreshToken'])
  callBroadcasterConnect() {
    tmi.connect('broadcaster')
  }

  async validate(type: 'bot' | 'broadcaster') {
    try {
      const { data } = await axios.get<{
        client_id: string,
        login: string,
        user_id: string,
        scopes: string[]
      }>('https://id.twitch.tv/oauth2/validate', { headers: {
        'Authorization': `OAuth ${this[`${type}AccessToken`]}`,
      } })

      return {
        ...data,
        clientId: data.client_id,
        userId: data.user_id,
      }
    } catch (e) {
      error((e as AxiosError).response.data ? e.response.data : e)
      throw `Can't validate access token of ${type}`
    }
  }

  async refresh(type: 'bot' | 'broadcaster') {
    try {
      const { data } = await axios.get<{ token: string, refresh: string }>('http://bot.satont.ru/api/refresh?refresh_token=' + this[`${type}RefreshToken`])

      this[`${type}AccessToken`] = data.token
      this[`${type}RefreshToken`] = data.refresh

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
