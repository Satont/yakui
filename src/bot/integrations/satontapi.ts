import { Integration } from 'typings'
import { Settings } from '@bot/entities/Settings'
import { error } from '@bot/libs/logger'
import axios from 'axios'
import { orm } from '@bot/libs/db'


export default new class SatontRu implements Integration {
  private base = axios.create({
    baseURL: 'http://api.satont.ru',
  })

  private apis: {
    faceit: {
      enabled: boolean,
      nickname: string,
    },
    songs: {
      enabled: boolean,
      vk: string,
      lastfm: string,
      twitchdj: number,
    }
  } = {
    faceit: {
      enabled: false,
      nickname: null,
    },
    songs: {
      enabled: false,
      vk: null,
      lastfm: null,
      twitchdj: null,
    },
  }

  async init() {
    const [faceit, songs] = await Promise.all([
      orm.em.getRepository(Settings).findOne({ space: 'satontapi', name: 'faceit' }),
      orm.em.getRepository(Settings).findOne({ space: 'satontapi', name: 'songs' }),
    ])
    
    if (faceit) this.apis.faceit = faceit.value as any
    if (songs) this.apis.songs = songs.value as any
  }

  async getFaceitData(): Promise<{ elo: number, lvl: number } | false> {
    if (!this.apis.faceit.enabled || !this.apis.faceit.nickname.trim().length) return false

    try {
      const { data } = await this.base.get('/faceit?nick=' + this.apis.faceit.nickname.trim())
      
      return { elo: data.elo, lvl: data.lvl }
    } catch (e) {
      error(e)
      return false
    }
  }

  async getSong(): Promise<string | false> {
    if (!this.apis.songs.enabled) return false

    try {
      const params = Object.entries(this.apis.songs)
        .filter(entry => Boolean(entry[1]))
        .map(entry => `${entry[0]}=${entry[1]}`)

      const { data } = await this.base.get('/song?' + params.join('&'))
      
      return data.length ? data : false
    } catch (e) {
      error(e)
      return false
    }
  }
}