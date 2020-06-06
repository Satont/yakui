import axios from 'axios'
import Settings from '../models/Settings'

export default new class Oauth {
  async validate (token: string | null, type: 'bot' | 'broadcaster') {
    if (!token) {
      throw `Token for ${type} was not provided, starting updating`
    }

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

      const [accessToken, accessTokenCreated]: [Settings, boolean] = await Settings.findOrCreate({ 
        where: { space: 'oauth', name: `${type}AccessToken` },
        defaults: { space: 'oauth', name: `${type}AccessToken`, value: data.token }
      })

      const [refreshToken, refreshTokenCreated]: [Settings, boolean] = await Settings.findOrCreate({ 
        where: { space: 'oauth', name: `${type}RefreshToken` },
        defaults: { space: 'oauth', name: `${type}RefreshToken`, value: data.refresh },
      })

      if (!accessTokenCreated) await accessToken.update({ value: data.token })
      if (!refreshTokenCreated) await refreshToken.update({ value: data.refresh })

      console.info(`Access token of ${type} was refreshed.`)
      return {
        access_token: data.token,
        refresh_token: data.refresh
      }
    } catch (e) {
      console.error(e)
      throw new Error(`Can't refresh access token of ${type}`)
    }
  }
}