import { error } from '@bot/libs/logger';
import axios from 'axios';
import { settings } from '../decorators';

class SatontApi {
  private base = axios.create({
    baseURL: 'http://api.satont.ru',
  })

  @settings()
  faceit = {
    enabled: false,
    nickname: null,
  }

  @settings()
  songs = {
    enabled: false,
    vk: null,
    lastfm: null,
    twitchdj: null,
  }

  async getFaceitData(): Promise<{ elo: number, lvl: number } | false> {
    if (!this.faceit.enabled || !this.faceit.nickname.trim().length) return false;

    try {
      const { data } = await this.base.get('/faceit?nick=' + this.faceit.nickname.trim());
      
      return { elo: data.elo, lvl: data.lvl };
    } catch (e) {
      error(e);
      return false;
    }
  }

  async getSong(): Promise<string | false> {
    if (!this.songs.enabled) return false;

    try {
      const params = Object.entries(this.songs)
        .filter(entry => Boolean(entry[1]))
        .map(entry => `${entry[0]}=${entry[1]}`);

      const { data } = await this.base.get('/song?' + params.join('&'));
      
      return data.length ? data : false;
    } catch (e) {
      error(e);
      return false;
    }
  }
}

export default new SatontApi();