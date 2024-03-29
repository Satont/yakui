/* eslint-disable @typescript-eslint/indent */
import tmi from '@bot/libs/tmi';
import humanizeDuration from 'humanize-duration';
import { onStreamStart, onStreamEnd } from '@bot/libs/eventsCaller';
import locales from '@bot/libs/locales';
import { System, CommandOptions } from 'typings';
import { INewSubscriber, INewResubscriber } from 'typings/events';
import { error } from '@bot/libs/logger';
import { prisma } from '@bot/libs/db';
import { settings } from '../decorators';
import { command } from '../decorators/command';
import { CommandPermission } from '@prisma/client';
import { EventSubChannelUpdateEvent } from '@twurple/eventsub';

class Twitch implements System {
  private intervals = {
    streamData: null,
    channelData: null,
    subscribers: null,
    latestFollower: null,
  };

  streamMetaData: {
    viewers: number;
    startedAt: Date;
  } = {
    viewers: 0,
    startedAt: null,
  };

  channelMetaData: {
    views: number;
    game: string;
    title: string;
    subs?: number;
    followers: number;
    latestSubscriber: {
      username: string;
      tier: string;
      timestamp: number;
    };
    latestFollower: {
      username: string;
      timestamp: number;
    };
    latestReSubscriber: {
      username: string;
      tier: string;
      months: number;
      overallMonths: number;
      timestamp: number;
    };
  } = {
    views: 0,
    game: 'No data',
    title: 'No data',
    subs: 0,
    followers: 0,
    latestSubscriber: {
      username: 'No data',
      tier: 'No data',
      timestamp: undefined,
    },
    latestReSubscriber: {
      username: 'No data',
      tier: 'No data',
      months: 0,
      overallMonths: 0,
      timestamp: undefined,
    },
    latestFollower: {
      username: 'No data',
      timestamp: undefined,
    },
  };

  @settings()
  latestSubscriber: string = null;

  @settings()
  latestReSubscriber: string = null;

  async init() {
    const [latestSubscriber, latestReSubscriber] = await Promise.all([
      prisma.settings.findFirst({ where: { space: 'twitch', name: 'latestSubscriber' } }),
      prisma.settings.findFirst({ where: { space: 'twitch', name: 'latestReSubscriber' } }),
    ]);

    if (latestSubscriber) this.channelMetaData.latestSubscriber = latestSubscriber.value as any;
    if (latestReSubscriber) this.channelMetaData.latestReSubscriber = latestReSubscriber.value as any;

    this.getStreamData();
    this.getChannelData();
    this.getChannelSubscribers();
    this.getChannelLatestFollower();
  }

  private async getStreamData() {
    clearInterval(this.intervals.streamData);
    this.intervals.streamData = setTimeout(() => this.getStreamData(), 1 * 60 * 1000);
    if (!tmi.channel?.id) return;

    const data = await tmi.bot.api?.helix.streams.getStreamByUserId(tmi.channel?.id);

    if (data && !this.streamMetaData.startedAt) onStreamStart();
    else if (!data && this.streamMetaData.startedAt) onStreamEnd();

    this.streamMetaData = {
      viewers: data?.viewers ?? 0,
      startedAt: data?.startDate ?? null,
    };

    if (!data) {
      return;
    }

    this.channelMetaData.game = (await data.getGame())?.name ?? '';
    this.channelMetaData.title = data.title;
  }

  async onStreamChange(data: EventSubChannelUpdateEvent) {
    if (data.categoryName) {
      this.channelMetaData.game = data.categoryName;
    }
    this.channelMetaData.title = data.streamTitle;
  }

  private async getChannelData() {
    clearTimeout(this.intervals.channelData);
    this.intervals.channelData = setTimeout(() => this.getChannelData(), 1 * 60 * 1000);
    if (!tmi.channel?.id) return;

    const channel = await tmi.bot.api.channels.getChannelInfo(tmi.channel?.id);
    if (!channel) return;
    const broadcaster = await channel.getBroadcaster();

    // @prettier-ignore
    this.channelMetaData.views = broadcaster.views ?? 0;
    this.channelMetaData.game = channel?.gameName ?? 'No data';
    this.channelMetaData.title = channel?.title ?? 'No data';
    this.channelMetaData.followers = /* channel?.followers ?? */ 0;
  }

  private async getChannelSubscribers() {
    clearTimeout(this.intervals.subscribers);
    this.intervals.subscribers = setTimeout(() => this.getChannelSubscribers(), 1 * 60 * 1000);

    try {
      if (!tmi.broadcaster.api || !tmi.channel?.id) return;
      const broadcaster = await tmi.broadcaster.api.helix.users.getMe();
      if (broadcaster.broadcasterType !== 'affiliate' && broadcaster.broadcasterType !== 'partner') {
        return;
      }
      const data = await tmi.broadcaster.api?.helix.subscriptions.getSubscriptionsPaginated(tmi.channel?.id).getAll();
      this.channelMetaData.subs = data.length - 1 || 0;
    } catch (e) {
      if (e.message.includes('This token does not have the requested scopes')) return;
      error(e.message);
    }
  }

  private async getChannelLatestFollower() {
    clearTimeout(this.intervals.latestFollower);
    this.intervals.latestFollower = setTimeout(() => this.getChannelLatestFollower(), 1 * 60 * 1000);

    if (!tmi.channel?.id) return;

    try {
      const { data } = (await tmi.bot.api?.users.getFollows({ followedUser: tmi.channel?.id })) || {};
      if (!data) return;
      const follower = data[0];

      this.channelMetaData.latestFollower = {
        username: follower.userDisplayName,
        timestamp: new Date(follower.followDate).getTime(),
      };
    } catch (e) {
      error(e);
    }
  }

  async getFollowAge(userId: string) {
    const follow = await tmi.bot.api?.users.getFollows({ followedUser: tmi.channel?.id, user: userId });
    if (!follow.total) return 'not follower';

    return humanizeDuration(Date.now() - new Date(follow.data[0].followDate).getTime(), {
      units: ['y', 'mo', 'd', 'h', 'm'],
      round: true,
      language: locales.translate('lang.code'),
    });
  }

  get uptime() {
    if (!this.streamMetaData?.startedAt) return 'offline';

    return humanizeDuration(Date.now() - new Date(this.streamMetaData?.startedAt).getTime(), {
      units: ['mo', 'd', 'h', 'm', 's'],
      round: true,
      language: locales.translate('lang.code'),
    });
  }

  @command({
    name: 'title',
    visible: false,
    description: 'commands.title.description',
  })
  async getTitle(opts: CommandOptions) {
    if (!opts.argument.trim().length) {
      return `$sender ${this.channelMetaData.title}`;
    } else {
      return this.setTitle(opts);
    }
  }

  @command({
    name: 'title set',
    visible: false,
    description: 'commands.title.description',
    permission: CommandPermission.MODERATORS,
  })
  async setTitle(opts: CommandOptions) {
    await tmi.bot.api.channels.updateChannelInfo(tmi.channel?.id, {
      title: opts.argument,
    });

    return '$sender ✅';
  }

  @command({
    name: 'category',
    aliases: ['game'],
    visible: true,
    description: 'commands.category.description',
  })
  async getGame(opts: CommandOptions) {
    if (!opts.argument.trim().length) {
      return `$sender ${this.channelMetaData.game}`;
    } else {
      return this.setGame(opts);
    }
  }

  @command({
    name: 'category set',
    aliases: ['game set'],
    permission: CommandPermission.MODERATORS,
    visible: false,
    description: 'commands.category.description',
  })
  async setGame(opts: CommandOptions) {
    const suggestedGame = await tmi.bot.api?.games.getGameByName(opts.argument);

    if (!suggestedGame) return;

    await tmi.bot.api.channels.updateChannelInfo(tmi.channel?.id, {
      gameId: suggestedGame.id,
    });

    return '$sender ✅';
  }

  async onSubscribe(data: INewSubscriber) {
    const value = { username: data.username, tier: data.tier, timestamp: Date.now() };
    this.channelMetaData.latestSubscriber = value;

    await prisma.settings.upsert({
      where: { settings_space_name_unique: { space: 'twitch', name: 'latestSubscriber' } },
      update: {
        value,
      },
      create: {
        space: 'twitch',
        name: 'latestSubscriber',
        value,
      },
    });
  }

  async onReSubscribe(data: INewResubscriber) {
    const value = {
      username: data.username,
      tier: data.tier,
      timestamp: Date.now(),
      months: data.months,
      overallMonths: data.overallMonths,
    };
    this.channelMetaData.latestReSubscriber = value;

    await prisma.settings.upsert({
      where: { settings_space_name_unique: { space: 'twitch', name: 'latestRESubscriber' } },
      update: {
        value,
      },
      create: {
        space: 'twitch',
        name: 'latestReSubscriber',
        value,
      },
    });
  }
}

export default new Twitch();
