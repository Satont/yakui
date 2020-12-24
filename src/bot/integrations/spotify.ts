import SpotifyApi from 'spotify-web-api-node'
import axios from 'axios'

import { Integration } from 'typings'
import { info, error } from '@bot/libs/logger'
import { onChange, onLoad, settings } from '../decorators'

class Spotify implements Integration {
  client: SpotifyApi | null = null
  private refreshTimeout: NodeJS.Timeout = null

  @settings()
  access_token: string = null

  @settings()
  refresh_token: string = null

  @settings()
  enabled = false
  
  @onChange(['enabled', 'access_token', 'refresh_token'])
  @onLoad()
  async init() {
    if (!this.access_token || !this.refresh_token || !this.enabled) return

    this.client = new SpotifyApi()
    await this.refreshTokens()

    info('SPOTIFY: Successfuly initiliazed.')
  }

  private async refreshTokens() {
    clearTimeout(this.refreshTimeout)
    this.refreshTimeout = setTimeout(() => this.refreshTokens(), 15 * 60 * 1000)
    if (!this.refresh_token) return
    try {
      const request = await axios.get('https://bot.satont.ru/api/spotify-refresh-token?refresh_token=' + this.refresh_token)
      const data = request.data

      this.client?.setAccessToken(data.access_token)

      info('SPOTIFY: refresh token and access_token updated.')
    } catch (e) {
      error(e)
    }
  }

  async getSong() {
    if (!this.client) return false
    const data = await this.client.getMyCurrentPlayingTrack()

    if (!data.body || !data.body?.item || !data.body.is_playing) return false

    return `${data.body.item.artists.map(o => o.name).join(', ')} — ${data.body.item.name}`
  }
}

export default new Spotify()
