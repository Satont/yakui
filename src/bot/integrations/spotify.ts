import SpotifyApi from 'spotify-web-api-node'
import axios from 'axios'

import { Integration } from "typings";
import Settings from "../models/Settings";
import { info } from '../libs/logger';


export default new class Spotify implements Integration {
  client: SpotifyApi | null = null
  private refreshTimeout: NodeJS.Timeout = null

  async init() {
    clearInterval(this.refreshTimeout)
    const [access_token, refresh_token, enabled]: [Settings, Settings, Settings] = await Promise.all([
      Settings.findOne({ where: { space: 'spotify', name: 'access_token' }}),
      Settings.findOne({ where: { space: 'spotify', name: 'refresh_token' }}),
      Settings.findOne({ where: { space: 'spotify', name: 'enabled' }})
    ])

    if (!access_token || !refresh_token || !enabled) return;
    if (!access_token.value.trim().length || !access_token.value.trim().length) return;

    if (this.client) this.client = null

    this.client = new SpotifyApi({ 
      accessToken: access_token.value
    })

    info('SPOTIFY: Successfuly initiliazed.')

    this.refreshTimeout = setTimeout(() => this.refreshTokens(), 1 * 60 * 60 * 1000);
  }

  private async refreshTokens() {
    clearInterval(this.refreshTimeout)
    this.refreshTimeout = setTimeout(() => this.refreshTokens(), 1 * 60 * 60 * 1000);

    const refresh_token: Settings = await Settings.findOne({ where: { space: 'spotify', name: 'refresh_token' }})
    const request = await axios.get('https://bot.satont.ru/api/spotify-refresh-token?refresh_token=' + refresh_token.value)
    const data = JSON.parse(request.data)

    this.client?.setAccessToken(data.access_token)
    
    refresh_token.update({ value: data.refresh_token })
    Settings.update({ value: data.access_token }, { where: { space: 'spotify', name: 'access_token' } })
  }

  async getSong() {
    if (!this.client) return false;
    const data = await this.client.getMyCurrentPlayingTrack()
  
    if (!data.body || !data.body?.item || !data.body.is_playing) return false

    return `${data.body.item.artists.map(o => o.name).join(', ')} — ${data.body.item.name}`
  }

  listenDbUpdates() {
    Settings.afterSave((instance) => {
      if (instance.space !== 'spotify') return;

      this.init()
    })
  }
}