import { error } from '@bot/libs/logger';
import axios from 'axios';
import { settings } from '../decorators';

export type FaceitResponse = {
  elo: number;
  lvl: number;
  todayEloDiff: string;
  latestMatches: Array<{
    team: string;
    teamScore: string;
    map: string;
    kd: string;
    hs: {
      percentage: string;
      number: string;
    };
    eloDiff: string;
    kills: string;
    death: string;
    result: string;
    createdAt: string;
    updatedAt: string;
  }>;
  stats: {
    lifetime: {
      'Current Win Streak': string;
      'Longest Win Streak': string;
      'K/D Ratio': string;
      'Total Headshots %': string;
      'Win Rate %': string;
      Wins: string;
      'Average K/D Ratio': string;
      'Average Headshots %': string;
      Matches: string;
    };
  };
};

class SatontApi {
  private base = axios.create({
    baseURL: 'http://api.satont.dev',
  });

  @settings()
  faceit = {
    enabled: false,
    nickname: null,
  };

  @settings()
  songs = {
    enabled: false,
    vk: null,
    lastfm: null,
    twitchdj: null,
  };

  async getFaceitData(): Promise<FaceitResponse | false> {
    if (!this.faceit.enabled || !this.faceit.nickname.trim().length) return false;

    try {
      const { data } = await this.base.get<FaceitResponse>('/faceit?nick=' + this.faceit.nickname.trim());

      return data;
    } catch (e) {
      error(e);
      return false;
    }
  }

  async getSong(): Promise<string | false> {
    if (!this.songs.enabled) return false;

    try {
      const params = Object.entries(this.songs)
        .filter((entry) => Boolean(entry[1]))
        .map((entry) => `${entry[0]}=${entry[1]}`);

      const { data } = await this.base.get('/song?' + params.join('&'));

      return data.length ? data : false;
    } catch (e) {
      error(e);
      return false;
    }
  }
}

export default new SatontApi();
