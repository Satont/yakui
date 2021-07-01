import tmi from './tmi';
import { error, info } from './logger';
import general from '../settings/general';
import * as TwitchEventSub from 'twitch-eventsub';
import * as panel from '../panel';
import { settings } from '../decorators';
import { EventSubChannelUpdateEvent } from 'twitch-eventsub/lib/Events/EventSubChannelUpdateEvent';
import { onAddModerator, onRemoveModerator, onUserFollow, onStreamChange } from '@bot/libs/eventsCaller';
import { EventSubChannelFollowEvent } from 'twitch-eventsub/lib/Events/EventSubChannelFollowEvent';
import { EventSubChannelModeratorEvent } from 'twitch-eventsub/lib/Events/EventSubChannelModeratorEvent';
import { loaded } from './loader';
import { ApiClient, ClientCredentialsAuthProvider } from 'twitch';
import oauth from './oauth';

class EventSubs {
  private adapter: TwitchEventSub.EventSubMiddleware;

  @settings()
  secret =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);

  async init() {
    const url = general.siteUrl.replace('https://', '').replace('http://', '');
    if (!panel.ready || !tmi.channel?.id || !loaded || !tmi.broadcaster?.api) {
      return setTimeout(() => this.init(), 1000);
    }
    if (url.includes('localhost')) {
      return info(`EventSub: incorrect domain ${url}, will not working`);
    }
    if ((await tmi.broadcaster.api.getTokenInfo()).userId !== tmi.channel.id) {
      return;
    }

    info('EventSub: starting initializating.');

    const api = new ApiClient({
      authProvider: new ClientCredentialsAuthProvider(oauth.clientId, oauth.clientSecret),
    });

    this.adapter = new TwitchEventSub.EventSubMiddleware(api, {
      hostName: url,
      pathPrefix: 'twitch/eventsub',
      secret: this.secret,
    });

    await api.helix.eventSub.deleteAllSubscriptions();

    await this.adapter.apply(panel.app);
    await this.adapter.markAsReady();

    await this.adapter.subscribeToChannelUpdateEvents(tmi.channel.id, onStreamChange).catch(error);
    await this.adapter.subscribeToChannelFollowEvents(tmi.channel.id, onUserFollow).catch(error);
    await this.adapter.subscribeToChannelModeratorAddEvents(tmi.channel.id, onAddModerator).catch(error);
    await this.adapter.subscribeToChannelModeratorRemoveEvents(tmi.channel.id, onRemoveModerator).catch(error);
    info(`EventSub: initializated.`);
    const subscriptions = await api.helix.eventSub.getSubscriptions();
    subscriptions.data.forEach((s) => console.log((s as any)._data));
  }
}

export default new EventSubs();
