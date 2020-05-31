import axios from 'axios'
import Settings from '../models/Settings'

export default new class Oauth {
  async validate (token: string, type: 'bot' | 'broadcaster') {
    try {
      const { data } = await axios.get('https://id.twitch.tv/oauth2/validate', { headers: {
        'Authorization': `OAuth ${token}`
      }})

      return {
        clientId: data.client_id,
        login: data.login,
        userId: data.user_id,
        scopes: data.scopes
      }
    } catch (e) {
      throw (`Can't validate access token of ${type}`)
    }
  }

  async refresh(token: string, type: 'bot' | 'broadcaster') {
    try {
      const { data } = await axios.get('http://bot.satont.ru/api/refresh?refresh_token=' + token)

      const [accessToken, refreshToken]: [Settings, Settings] = await Promise.all([
        Settings.findOne({ where: { space: 'oauth', name: `${type}AccessToken` } }),
        Settings.findOne({ where: { space: 'oauth', name: `${type}RefreshToken` } })
      ])

      await refreshToken.update({ value: data.refresh })
      await accessToken.update({ value: data.token })

      console.info(`Access token of ${type} was refreshed.`)
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }
    } catch (e) {
      console.error(e)
      throw new Error(`Can't refresh access token of ${type}`)
    }
  }
}