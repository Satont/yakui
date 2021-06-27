import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';
import _, { sample } from 'lodash';
import hd from 'humanize-duration';

import twitch from './twitch';
import includesOneOf from '@bot/commons/includesOneOf';
import users from './users';
import tmi from '@bot/libs/tmi';
import currency from '@bot/libs/currency';
import Axios from 'axios';
import { System, Command } from 'typings';
import spotify from '@bot/integrations/spotify';
import locales from '@bot/libs/locales';
import evaluate from '@bot/commons/eval';
import satontapi from '@bot/integrations/satontapi';
import Commands from './commands';
import { prisma } from '@bot/libs/db';
import { CommandPermission } from '@prisma/client';

class Variables implements System {
  variables: Array<{ name: string; response: string; custom?: boolean }> = [
    { name: '$sender', response: 'Username of user who triggered message' },
    { name: '$followage', response: 'Followage of user' },
    { name: '$stream.uptime', response: 'Current stream uptime' },
    { name: '$stream.viewers', response: 'Current stream viewers' },
    { name: '$channel.views', response: 'Channel views' },
    { name: '$channel.game', response: 'Channel game' },
    { name: '$channel.title', response: 'Channel title' },
    { name: '$channel.followers', response: 'Number of channel followers' },
    { name: '$random.online.user', response: 'Pick`s random online user' },
    { name: '$random.N-N', response: 'Random beetwen 2 numbers' },
    { name: '$subs', response: 'Count of channel subscribers' },
    { name: '$subs.last.sub.username', response: 'Username of latest subscriber' },
    { name: '$subs.last.sub.ago', response: 'Time passed from latest subscribe' },
    { name: '$subs.last.sub.tier', response: 'Tier of latest subscribe' },
    { name: '$subs.last.resub.username', response: 'Username of latest resubscriber' },
    { name: '$subs.last.resub.ago', response: 'Time passed from latest subscribe' },
    { name: '$subs.last.resub.tier', response: 'Tier of latest resubscribe' },
    { name: '$subs.last.resub.months', response: 'User subscribe months length' },
    { name: '$subs.last.resub.months', response: 'Overall user subscribe months length' },
    { name: '$followers.last.username', response: 'Username of latest follower' },
    { name: '$followers.last.ago', response: 'Time passed from latest follow' },
    { name: '$song', response: 'Current playing song' },
    { name: '$commands', response: 'Commands list' },
    { name: '$prices', response: 'Commands prices list' },
    { name: '$top.points', response: 'Top 10 by points' },
    { name: '$top.bits', response: 'Top 10 by bits' },
    { name: '$top.tips', response: 'Top 10 by tips' },
    { name: '$top.time', response: 'Top 10 by time' },
    { name: '$top.messages.today', response: 'Top 10 by messages today' },
    { name: '$top.messages', response: 'Top 10 by messages' },
    { name: '(eval)', response: 'JavaScript evaluate' },
    { name: '$faceit.lvl', response: 'Faceit lvl' },
    { name: '$faceit.elo', response: 'Faceit elo' },
    { name: '$faceit.todayEloDiff', response: 'Faceit elo diff for current day' },
    { name: '$faceit.latestMatches', response: 'Faceit latest matches stats' },
    { name: '$faceit.stats.lifetime.currentstreak', response: 'Faceit current win streak' },
    { name: '$faceit.stats.lifetime.kdratio', response: 'Faceit lifetime K/D ratio' },
    { name: '$faceit.stats.lifetime.headshots', response: 'Faceit lifetime headshots number' },
    { name: '$faceit.stats.lifetime.winrate', response: 'Faceit lfietime winrate' },
    { name: '$faceit.stats.lifetime.wins', response: 'Faceit total wins' },
    { name: '$faceit.stats.lifetime.avgkd', response: 'Faceit lifetime avg K/D' },
    { name: '$faceit.stats.lifetime.avghspercentage', response: 'Faceit avarage headshots percentage' },
    { name: '$faceit.stats.lifetime.matches', response: 'Faceit lifetime matches played' },
    { name: '$user.messages', response: 'User messages' },
    { name: '$user.daily.messages', response: 'User today messages' },
    { name: '$user.tips', response: 'User tips' },
    { name: '$user.bits', response: 'User bits' },
    { name: '$user.watched', response: 'User watched time' },
    { name: '$user.points', response: 'User points' },
    {
      name: '(api|GET/POST|http://example.com)',
      response: 'Make api request. If response it plain text use (api._response). If response is json use (api.someVariableFromJson)',
    },
    { name: '$command.stats.used', response: 'How much times command was used' },
  ];

  async init() {
    const variables = (await prisma.variables.findMany()).map((variable) => ({
      name: `$_${variable.name}`,
      response: variable.response,
      custom: true,
    }));

    this.variables.push(...variables);
  }

  async parseMessage(opts: { message: string; raw?: TwitchPrivateMessage; argument?: string; command?: Command }) {
    let result = opts.message;
    const userInfo = opts.raw?.userInfo;
    const getLatestAgoString = (timestamp: number) =>
      hd(Date.now() - timestamp, {
        units: ['mo', 'd', 'h', 'm'],
        round: true,
        language: locales.translate('lang.code'),
      });

    result = result
      .replace(/\$sender/gimu, '@' + userInfo?.userName ?? tmi.bot.chat?.currentNick)
      .replace(/\$stream\.viewers/gimu, String(twitch.streamMetaData.viewers))
      .replace(/\$channel\.views/gimu, String(twitch.channelMetaData.views))
      .replace(/\$channel\.game/gimu, twitch.channelMetaData.game)
      .replace(/\$channel\.title/gimu, twitch.channelMetaData.title)
      .replace(/\$stream\.uptime/gimu, twitch.uptime)
      .replace(/\$random\.(\d+)-(\d+)/gimu, (match, first, second) => String(_.random(first, second)))
      .replace(/\$subs\.last\.sub\.username/gimu, twitch.channelMetaData.latestSubscriber?.username)
      .replace(/\$subs\.last\.sub\.ago/gimu, getLatestAgoString(twitch.channelMetaData.latestSubscriber?.timestamp))
      .replace(/\$subs\.last\.sub\.tier/gimu, twitch.channelMetaData.latestSubscriber?.tier)
      .replace(/\$subs\.last\.resub\.username/gimu, twitch.channelMetaData.latestReSubscriber?.username)
      .replace(/\$subs\.last\.resub\.ago/gimu, getLatestAgoString(twitch.channelMetaData.latestReSubscriber?.timestamp))
      .replace(/\$subs\.last\.resub\.tier/gimu, twitch.channelMetaData.latestReSubscriber?.tier)
      .replace(/\$subs\.last\.resub\.months/gimu, String(twitch.channelMetaData.latestReSubscriber?.months))
      .replace(/\$subs\.last\.resub\.overallMonths/gimu, String(twitch.channelMetaData.latestReSubscriber?.overallMonths))
      .replace(/\$subs/gimu, String(twitch.channelMetaData.subs))
      .replace(/\$followers\.last\.username/gimu, twitch.channelMetaData.latestFollower.username)
      .replace(/\$followers\.last\.ago/gimu, getLatestAgoString(twitch.channelMetaData.latestFollower.timestamp));

    if (/\$followage/gimu.test(result)) {
      result = result.replace(/\$followage/gimu, userInfo ? await twitch.getFollowAge(userInfo.userId) : 'invalid');
    }

    if (/\$song/gimu.test(result)) {
      result = result.replace(/\$song/gimu, await this.getSong());
    }

    if (/\$commands/gimu.test(result)) {
      result = result.replace(/\$commands/gimu, Commands.getCommandList().join(', '));
    }

    if (/\$prices/gimu.test(result)) {
      result = result.replace(
        /\$prices/gimu,
        Commands.getPricesList()
          .map((c) => `${c.name} — ${c.price}`)
          .join(', '),
      );
    }

    if (/\$top\.points/gimu.test(result)) {
      result = result.replace(/\$top\.points/gimu, await this.getTop('points', opts.argument));
    }

    if (/\$top\.bits/gimu.test(result)) {
      result = result.replace(/\$top\.bits/gimu, await this.getTop('bits', opts.argument));
    }

    if (/\$top\.tips/gimu.test(result)) {
      result = result.replace(/\$top\.tips/gimu, await this.getTop('tips', opts.argument));
    }

    if (/\$top\.time/gimu.test(result)) {
      result = result.replace(/\$top\.time/gimu, await this.getTop('watched', opts.argument));
    }

    if (/\$top\.messages\.today/gimu.test(result)) {
      result = result.replace(/\$top\.messages\.today/gimu, await this.getTop('messages.today', opts.argument));
    }

    if (/\$top\.messages/gimu.test(result)) {
      result = result.replace(/\$top\.messages/gimu, await this.getTop('messages', opts.argument));
    }

    if (/\$random\.online\.user/gimu.test(result)) {
      const queryUsers = users.chatters.filter((u) => u.id !== String(opts.raw.userInfo.userId)).map((c) => Number(c.id));
      const dbUsers = await prisma.users.findMany({
        where: {
          id: {
            in: queryUsers,
          },
          messages: {
            gt: 2,
          },
        },
      });

      const randomOnlineUser = sample(dbUsers);
      const randomUser = users.chatters.find((u) => String(randomOnlineUser?.id) === u.id);

      result = result.replace(/\$random\.online\.user/gimu, randomUser?.username ?? 'Ghost');
    }

    if (/(\(eval)(.*)(\))/gimu.test(result)) {
      const toEval = result.match(/(\(eval)(.*)(\))/)[2].trim();
      result = result.replace(/(\(eval)(.*)(\))/gimu, await evaluate({ raw: opts.raw, param: opts.argument, message: toEval }));
    }

    if (/\$command\.stats\.used/gimu.test(result)) {
      result = result.replace(/\$command\.stats\.used/gimu, String(opts.command?.usage ?? 'unknown'));
    }

    if (/\$faceit\.[a-z]+/gimu.test(result)) {
      const faceitData = await satontapi.getFaceitData();

      if (faceitData) {
        result = result
          .replace(/\$faceit\.elo/, String(faceitData.elo))
          .replace(/\$faceit\.lvl/, String(faceitData.lvl))
          .replace(/\$faceit\.todayEloDiff/, faceitData.todayEloDiff)
          .replace(
            /\$faceit\.latestMatches/,
            faceitData.latestMatches
              .map(
                (m) =>
                  `${m.result} ${m.eloDiff} on ${m.map} (${m.teamScore}), KD: ${m.kd} (${m.kills}/${m.death}), HS: ${m.hs.number}(${m.hs.percentage}%)`,
              )
              .join(' | '),
          )
          .replace(/\$faceit\.stats\.lifetime\.currentstreak/, faceitData.stats.lifetime['Current Win Streak'])
          .replace(/\$faceit\.stats\.lifetime\.kdratio/, faceitData.stats.lifetime['K/D Ratio'])
          .replace(/\$faceit\.stats\.lifetime\.headshots/, faceitData.stats.lifetime['Total Headshots %'])
          .replace(/\$faceit\.stats\.lifetime\.winrate/, faceitData.stats.lifetime['Win Rate %'])
          .replace(/\$faceit\.stats\.lifetime\.wins/, faceitData.stats.lifetime['Wins'])
          .replace(/\$faceit\.stats\.lifetime\.avgkd/, faceitData.stats.lifetime['Average K/D Ratio'])
          .replace(/\$faceit\.stats\.lifetime\.avghspercentage/, faceitData.stats.lifetime['Average Headshots %'])
          .replace(/\$faceit\.stats\.lifetime\.matches/, faceitData.stats.lifetime.Matches);
      }
    }

    if (/\$_[0-9a-z]+/gimu.test(result)) {
      result = await this.parseCustomVariables(result);
    }

    if (
      includesOneOf(result, ['user.messages', 'user.tips', 'user.bits', 'user.watched', 'user.points', 'user.daily.messages']) &&
      userInfo
    ) {
      const user = await users.getUserStats({ id: userInfo?.userId });

      result = result
        .replace(/\$user\.messages/gimu, String(user.messages))
        .replace(/\$user\.watched/gimu, user.watchedFormatted)
        .replace(/\$user\.tips/gimu, String(user.totalTips))
        .replace(/\$user\.bits/gimu, String(user.totalBits))
        .replace(/\$user\.points/gimu, String(user.points))
        .replace(/\$user\.daily\.messages/gimu, String(user.todayMessages));
    }

    if (result.includes('(api|')) {
      result = await this.makeApiRequest(result);
    }

    return result;
  }

  async getTop(type: 'watched' | 'tips' | 'bits' | 'messages' | 'messages.today' | 'points', page = '1') {
    let result: Array<{ username: string; value: number }> = [];
    if (isNaN(Number(page))) page = '1';
    if (Number(page) <= 0) page = '1';

    const offset = (Number(page) - 1) * 10;

    const ignored = [...users.ignoredUsers, tmi.channel?.name.toLowerCase(), tmi.bot.chat?.currentNick].filter(Boolean);
    const limit = 10;

    if (type === 'watched') {
      result = (
        await prisma.users.findMany({
          where: {
            username: {
              notIn: ignored,
            },
          },
          take: limit,
          skip: offset,
          orderBy: {
            [type]: 'desc',
          },
        })
      ).map((u) => ({ username: u.username, value: Number(u[type]) }));

      return result
        .map((result, index) => `${index + 1 + offset}. ${result.username} - ${(result.value / (1 * 60 * 1000) / 60).toFixed(1)}h`)
        .join(', ');
    } else if (type === 'messages') {
      result = (
        await prisma.users.findMany({
          where: {
            username: {
              notIn: ignored,
            },
          },
          take: limit,
          skip: offset,
          orderBy: {
            [type]: 'desc',
          },
        })
      ).map((u) => ({ username: u.username, value: u[type] }));

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ');
    } else if (type === 'tips') {
      const sql = `select "user"."id", "user"."username", COALESCE(SUM("tips"."inMainCurrencyAmount"), 0) as "value" from "users" as "user" inner join "users_tips" as "tips" on "user"."id" = "tips"."userId" where 1 = 1 group by "user"."id" order by "value" desc limit ${limit} offset ${offset}`;
      const result: Array<{ id: number; username: string; value: number }> = await prisma.$queryRaw(sql);

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}${currency.botCurrency}`).join(', ');
    } else if (type === 'bits') {
      const sql = `select "user"."id", "user"."username", COALESCE(SUM("tips"."amount"), 0) as "value" from "users" as "user" inner join "users_bits" as "bits" on "user"."id" = "tips"."userId" where 1 = 1 group by "user"."id" order by "value" desc limit ${limit} offset ${offset}`;
      const result: Array<{ id: number; username: string; value: number }> = await prisma.$queryRaw(sql);

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ');
    } else if (type === 'messages.today') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      result = (
        await prisma.usersDailyMessages.findMany({
          where: {
            date: startOfDay.getTime(),
          },
          take: limit,
          orderBy: {
            count: 'desc',
          },
          skip: offset,
          include: {
            user: true,
          },
        })
      ).map((daily) => ({ username: daily.user.username, value: daily.count }));

      return result.map((item, index: number) => `${index + 1 + offset}. ${item.username} - ${item.value}`).join(', ');
    }
    if (type === 'points') {
      result = (
        await prisma.users.findMany({
          where: {
            username: {
              notIn: ignored,
            },
          },
          take: limit,
          orderBy: {
            [type]: 'desc',
          },
          skip: offset,
        })
      ).map((u) => ({ username: u.username, value: u[type] }));

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ');
    } else {
      return 'unknown type of top';
    }
  }

  async makeApiRequest(result: string) {
    const match = result.match(/\((api)\|(POST|GET)\|(\S+)\)/);
    if (match.length) {
      // '(api|GET|https://qwe.ru)' = ["(api|GET|https://qwe.ru)", "api", "GET", "https://qwe.ru", index: 0, input: "(api|GET|https://qwe.ru)", groups: undefined]
      result = result.replace(match[0], '');
      const method: 'GET' | 'POST' = match[2] as any;
      const url = match[3];

      try {
        let { data } = await Axios({ method, url });
        // search for api datas in message
        const rData = result.match(/\(api\.(?!_response)(\S*?)\)/gi);
        if (_.isNil(rData)) {
          if (_.isObject(data)) {
            // Stringify object
            result = result.replace('(api._response)', JSON.stringify(data));
          } else {
            result = result.replace('(api._response)', data.toString().replace(/^"(.*)"/, '$1'));
          }
        } else {
          if (_.isBuffer(data)) {
            data = JSON.parse(data.toString());
          }
          for (const tag of rData) {
            let path = data;
            const ids = tag
              .replace('(api.', '')
              .replace(')', '')
              .split('.');
            _.each(ids, function(id) {
              const isArray = id.match(/(\S+)\[(\d+)\]/i);
              if (isArray) {
                path = path[isArray[1]][isArray[2]];
              } else {
                path = path[id];
              }
            });
            result = result.replace(tag, !_.isNil(path) ? path : 'possible you parsing api wrong');
          }
        }

        return result;
      } catch (e) {
        return `error: ${e.message}`;
      }
    } else return result;
  }

  async parseCustomVariables(result: string) {
    for (const variable of this.variables.filter((v) => v.custom)) {
      const match = result.match(new RegExp(`\\${variable.name}`));
      if (!match) continue;
      result = result.replace(match[0], variable.response);
    }

    return result;
  }

  async changeCustomVariable({ raw, text, response }: { raw: TwitchPrivateMessage; response: string; text: string }) {
    const isAdmin = users.hasPermission(raw.userInfo.badges, CommandPermission.MODERATORS, raw);

    if (isAdmin && text.length) {
      const match = response.match(/\$_(\S*)/g);
      if (match) {
        await prisma.variables.update({
          where: {
            name: this.variables.find((v) => v.name === match[0].replace('$_', '')).name,
          },
          data: {
            response: text,
          },
        });
        tmi.say({ message: `@${raw.userInfo.userName} ✅` });
        return true;
      } else return false;
    } else return false;
  }

  async getSong() {
    const [spotifySong, satontApiSong] = await Promise.all([spotify.getSong(), satontapi.getSong()]);

    return spotifySong || satontApiSong || locales.translate('song.notPlaying');
  }
}

export default new Variables();
