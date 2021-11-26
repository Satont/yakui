import { onChange, onLoad, settings } from '../decorators';
import tmi from './tmi';

class OAuth {
  @settings()
    channel: string = null;

  @settings()
    clientId: string = null;

  @settings()
    clientSecret: string = null;

  @settings()
    botAccessToken: string = null;

  @settings()
    botRefreshToken: string = null;

  @settings()
    broadcasterAccessToken: string = null;

  @settings()
    broadcasterRefreshToken: string = null;

  @onChange(['channel'])
  async callTmi() {
    await this.callBotConnect();
    await this.callBroadcasterConnect();
  }

  @onLoad()
  async callConnect() {
    await this.callTmi();
  }

  @onChange('botRefreshToken')
  callBotConnect() {
    return tmi.connect('bot');
  }

  @onChange('broadcasterRefreshToken')
  callBroadcasterConnect() {
    return tmi.connect('broadcaster');
  }
}

export default new OAuth();
