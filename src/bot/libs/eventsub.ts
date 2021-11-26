import tmi from './tmi';
import { error, info } from './logger';
import general from '../settings/general';
import * as TwitchEventSub from '@twurple/eventsub';
import panel from '../panel';
import { settings } from '../decorators';
import { onAddModerator, onRemoveModerator, onUserFollow, onStreamChange } from '@bot/libs/eventsCaller';
import { ApiClient } from '@twurple/api';
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import oauth from './oauth';

class EventSubs {
  private timers: {
    followCache: NodeJS.Timer;
  } = {
      followCache: null,
    };
  private followCache: string[] = [];
  private adapter: TwitchEventSub.EventSubMiddleware;
  //private listener: TwitchEventSub.EventSubListener;

  @settings()
    secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  async init() {
    const url = general.siteUrl.replace('https://', '').replace('http://', '');
    const api = new ApiClient({
      authProvider: new ClientCredentialsAuthProvider(oauth.clientId, oauth.clientSecret),
    });
    this.adapter = new TwitchEventSub.EventSubMiddleware({
      apiClient: api,
      hostName: url,
      pathPrefix: 'eventsub',
      secret: this.secret,
    });
    this.timers.followCache = setInterval(() => (this.followCache = []), 10 * 60 * 1000);
    process
      .on('exit', () => clearInterval(this.timers.followCache))
      .on('SIGINT', () => clearInterval(this.timers.followCache))
      .on('SIGTERM', () => clearInterval(this.timers.followCache));

    /* this.adapter = new TwitchEventSub.MiddlewareAdapter({
      hostName: url,
      pathPrefix: 'eventsub',
    });

    this.listener = new TwitchEventSub.EventSubListener(api, this.adapter, this.secret); */

    if (!tmi.channel?.id || !tmi.broadcaster?.api) {
      return setTimeout(() => this.init(), 1000);
    }
    await this.adapter.apply(panel.app);
    //await this.listener.applyMiddleware(panel.app);
    if (url.includes('localhost')) {
      return info(`EventSub: incorrect domain ${url}, will not working`);
    }
    if ((await tmi.broadcaster.api.getTokenInfo()).userId !== tmi.channel.id) {
      return;
    }

    info('EventSub: starting initializating.');

    await api.helix.eventSub.deleteAllSubscriptions();
    await this.adapter.markAsReady();

    await this.adapter.subscribeToChannelUpdateEvents(tmi.channel.id, onStreamChange).catch(error);
    await this.adapter
      .subscribeToChannelFollowEvents(tmi.channel.id, (follow) => {
        if (this.followCache.includes(follow.userId)) return;
        this.followCache.push(follow.userId);
        onUserFollow(follow);
      })
      .catch(error);
    await this.adapter.subscribeToChannelModeratorAddEvents(tmi.channel.id, onAddModerator).catch(error);
    await this.adapter.subscribeToChannelModeratorRemoveEvents(tmi.channel.id, onRemoveModerator).catch(error);
    info(`EventSub: initializated.`);
  }
}

export default new EventSubs();
