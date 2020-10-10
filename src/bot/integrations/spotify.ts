import SpotifyApi from 'spotify-web-api-node'
import axios from 'axios'

import { Integration } from 'typings'
import { Settings } from '@bot/entities/Settings'
import { info, error } from '@bot/libs/logger'
import { orm } from '@bot/libs/db'
import { onChange, settings } from '../decorators'

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
  async init() {
    clearInterval(this.refreshTimeout)

    if (!this.access_token || !this.refresh_token || !this.enabled) return

    if (this.client) this.client = null

    this.client = new SpotifyApi({ 
      accessToken: this.access_token,
    })

    info('SPOTIFY: Successfuly initiliazed.')

    this.refreshTokens()
  }

  private async refreshTokens() {
    clearInterval(this.refreshTimeout)
    this.refreshTimeout = setTimeout(() => this.refreshTokens(), 1 * 60 * 60 * 1000)

    try {
      const refresh_token = await orm.em.fork().getRepository(Settings).findOne({ space: 'spotify', name: 'refresh_token' })
      const request = await axios.get('https://bot.satont.ru/api/spotify-refresh-token?refresh_token=' + refresh_token.value)
      const data = request.data

      this.client?.setAccessToken(data.access_token)
      
      refresh_token.value = data.refresh_token

      await orm.em.fork().persistAndFlush(refresh_token)
      await orm.em.fork().getRepository(Settings).nativeUpdate({ space: 'spotify', name: 'access_token' }, { value: data.access_token })

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