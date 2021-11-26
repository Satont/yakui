import { System, ParserOptions, CommandOptions, UserPermissions } from 'typings';
import tmi from '@bot/libs/tmi';
import twitch from './twitch';
import { PrivateMessage } from '@twurple/chat';
import { prisma } from '@bot/libs/db';
import { settings } from '../decorators';
import { parser } from '../decorators/parser';
import { command } from '../decorators/command';
import { getChatters } from '../microtasks/getChatters';
import oauth from '../libs/oauth';
import { countWatched } from '../microtasks/countWatched';
import { CommandPermission } from '@prisma/client';

class Users implements System {
  private countWatchedTimeout: NodeJS.Timeout = null;
  private getChattersTimeout: NodeJS.Timeout = null;
  chatters: Array<{ username: string; id: string }> = [];

  @settings()
    enabled = true;

  @settings()
    ignoredUsers: string[] = [];

  @settings()
    botAdmins: string[] = [];

  @settings()
    points = {
      enabled: true,
      messages: {
        interval: 1,
        amount: 1,
      },
      watch: {
        interval: 1,
        amount: 1,
      },
    };

  async init() {
    await this.getChatters();
    await this.countWatched();
  }

  @parser()
  async parseMessage(opts: ParserOptions) {
    if (!this.enabled || opts.message.startsWith('!')) return;
    if (this.isIgnored(opts.raw.userInfo.userName) || this.isIgnored(opts.raw.userInfo.userId)) return;
    if (!twitch.streamMetaData.startedAt) return;

    const [pointsPerMessage, pointsInterval] = [this.points.messages.amount, this.points.messages.interval * 60 * 1000];

    const [id, username] = [opts.raw.userInfo.userId, opts.raw.userInfo.userName];

    const user = await prisma.users.upsert({
      where: {
        id: Number(id),
      },
      update: {
        messages: {
          increment: 1,
        },
        username,
      },
      create: {
        id: Number(id),
        username,
        messages: 0,
      },
    });

    const updatePoints = Number(user.lastMessagePoints) + pointsInterval <= user.messages && this.points.enabled;

    if (updatePoints && twitch.streamMetaData?.startedAt && pointsPerMessage !== 0 && pointsInterval !== 0) {
      await prisma.users.update({
        where: { id: user.id },
        data: { points: { increment: pointsPerMessage }, lastMessagePoints: BigInt(new Date().getTime()) },
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    await prisma.usersDailyMessages.upsert({
      where: {
        users_daily_messages_userid_name_unique: {
          userId: user.id,
          date: BigInt(startOfDay.getTime()),
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        userId: user.id,
        date: BigInt(startOfDay.getTime()),
        count: 1,
      },
    });
  }

  async getUserStats({ id, username }: { id?: string; username?: string }) {
    if (!id && !username) throw new Error('Id or username should be used.');

    if (!id) {
      const byName = await tmi.bot.api?.helix.users.getUserByName(username);
      id = byName.id;
      username = byName.name;
    }

    return await prisma.users.upsert({
      where: {
        id: Number(id),
      },
      update: {},
      create: {
        id: Number(id),
        username,
      },
      include: {
        tips: true,
        bits: true,
        daily_messages: true,
      },
    });
  }

  private async countWatched() {
    clearTimeout(this.countWatchedTimeout);
    this.countWatchedTimeout = setTimeout(() => this.countWatched(), 1 * 60 * 1000);
    const [pointsPerWatch, pointsInterval] = [this.points.watch.amount, this.points.watch.interval * 60 * 1000];

    if (!twitch.streamMetaData?.startedAt || !this.enabled) return;

    countWatched({
      chatters: this.chatters.filter((c) => !this.isIgnored(c.username.toLowerCase())),
      points: {
        enabled: this.points.enabled,
        perWatch: pointsPerWatch,
        interval: pointsInterval,
      },
    });
  }

  private async getChatters() {
    clearTimeout(this.getChattersTimeout);
    this.getChattersTimeout = setTimeout(() => this.getChatters(), 1 * 60 * 1000);
    if (!oauth.botAccessToken || !oauth.clientId || !oauth.channel || !tmi?.bot?.auth) {
      return;
    }
    this.chatters = await getChatters({
      accessToken: (await tmi.bot.auth.getAccessToken()).accessToken,
      clientId: oauth.clientId,
      channel: oauth.channel,
    });
  }

  @command({
    name: 'sayb',
    permission: CommandPermission.BROADCASTER,
    visible: false,
    description: 'commands.sayb.description',
  })
  sayb(opts: CommandOptions) {
    tmi.broadcaster.chat?.say(tmi.channel?.name, opts.argument);
  }

  getUserPermissions(badges: Map<string, string>, raw?: PrivateMessage): UserPermissions {
    return {
      BROADCASTER: badges.has('broadcaster') || this.botAdmins?.includes(raw?.userInfo.userName),
      MODERATORS: badges.has('moderator'),
      VIPS: badges.has('vip'),
      SUBSCRIBERS: badges.has('subscriber') || badges.has('founder'),
      VIEWERS: true,
    };
  }

  hasPermission(badges: Map<string, string>, searchForPermission: CommandPermission, raw?: PrivateMessage) {
    if (!searchForPermission) return true;

    const userPerms = Object.entries(this.getUserPermissions(badges, raw));
    const commandPermissionIndex = userPerms.indexOf(userPerms.find((perm) => perm[0] === searchForPermission));

    const hasPerm = userPerms.some((p, index) => p[1] && index <= commandPermissionIndex);
    return hasPerm;
  }

  @command({
    name: 'ignore add',
    permission: CommandPermission.MODERATORS,
    visible: false,
    description: 'commands.ignore.add.description',
  })
  async ignoreAdd(opts: CommandOptions) {
    if (!opts.argument.length) return;

    this.ignoredUsers = [...this.ignoredUsers, opts.argument.toLowerCase()];

    return '$sender ✅';
  }

  @command({
    name: 'ignore remove',
    permission: CommandPermission.MODERATORS,
    visible: false,
    description: 'commands.ignore.remove.description',
  })
  async ignoreRemove(opts: CommandOptions) {
    if (!opts.argument.length) return;

    if (!this.isIgnored(opts.argument.toLowerCase())) return;

    this.ignoredUsers.splice(this.ignoredUsers.indexOf(opts.argument.toLowerCase()), 1);

    return '$sender ✅';
  }

  isIgnored(user: string | number) {
    return this.ignoredUsers?.includes(String(user));
  }
}

export default new Users();
