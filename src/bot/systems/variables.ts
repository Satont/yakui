import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import _ from 'lodash'
import hd from 'humanize-duration'

import twitch from './twitch'
import includesOneOf from '@bot/commons/includesOneOf'
import users from './users'
import tmi from '@bot/libs/tmi'
import { User as UserModel } from '@bot/entities/User'
import currency from '@bot/libs/currency'
import Axios from 'axios'
import { System, Command } from '@src/typings'
import { Variable } from '@bot/entities/Variable'
import spotify from '@bot/integrations/spotify'
import locales from '@bot/libs/locales'
import evaluate from '@bot/commons/eval'
import satontapi from '@bot/integrations/satontapi'
import Commands from './commands'
import { UserDailyMessages } from '@bot/entities/UserDailyMessages'
import { orm } from '@bot/libs/db'
import { CommandPermission } from '../entities/Command'
import { QueryBuilder } from '@mikro-orm/postgresql'

export default new class Variables implements System {
  variables: Array<{ name: string, response: string, custom?: boolean }> = [
    { name: '$sender', response: 'Username of user who triggered message' },
    { name: '$followage', response: 'Followage of user' },
    { name: '$stream.uptime', response: 'Current stream uptime' },
    { name: '$stream.viewers', response: 'Current stream viewers' },
    { name: '$channel.views', response: 'Channel views' },
    { name: '$channel.game', response: 'Channel game' },
    { name: '$channel.title', response: 'Channel title' },
    { name: '$random.N-N', response: 'Random beetwen 2 numbers' },
    { name: '$subs', response: 'Count of channel subscribers' },
    { name: '$subs.last.sub.username', response: 'Username of latest subscriber' },
    { name: '$subs.last.sub.ago', response: 'Time passed from latest subscribe' },
    { name: '$subs.last.sub.tier', response: 'Tier of latest subscribe' },
    { name: '$subs.last.resub.username', response: 'Username of latest resubscriber' },
    { name: '$subs.last.resub.ago', response: 'Time passed from latestre subscribe' },
    { name: '$subs.last.resub.tier', response: 'Tier of latest resubscribe' },
    { name: '$subs.last.resub.months', response: 'User subscribe months length' },
    { name: '$subs.last.resub.months', response: 'Overall user subscribe months length' },
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
    { name: '$user.messages', response: 'User messages' },
    { name: '$user.daily.messages', response: 'User today messages' },
    { name: '$user.tips', response: 'User tips' },
    { name: '$user.bits', response: 'User bits' },
    { name: '$user.watched', response: 'User watched time' },
    { name: '$user.points', response: 'User points' },
    { name: '(api|GET/POST|http://example.com)', response: 'Make api request. If response it plain text use (api._response). If response is json use (api.someVariableFromJson)' },
    { name: '$command.stats.used', response: 'How much times command was used' },
  ]

  async init() {
    const repository = orm.em.getRepository(Variable)
    const variables = (await repository.findAll())
      .map((variable: Variable) => ({ name: `$_${variable.name}`, response: variable.response, custom: true }))
      

    this.variables.push(...variables)

    this.getTop('tips')
  }

  async parseMessage(opts: { message: string, raw?: TwitchPrivateMessage, argument?: string, command?: Command }) {
    let result = opts.message
    const userInfo = opts.raw?.userInfo
    result = result
      .replace(/\$sender/gimu, '@' + userInfo?.userName ?? tmi.chatClients?.bot?.currentNick)
      .replace(/\$stream\.viewers/gimu, String(twitch.streamMetaData.viewers))
      .replace(/\$channel\.views/gimu, String(twitch.channelMetaData.views))
      .replace(/\$channel\.game/gimu, twitch.channelMetaData.game)
      .replace(/\$channel\.title/gimu, twitch.channelMetaData.title)
      .replace(/\$stream\.uptime/gimu, twitch.uptime)
      .replace(/\$random\.(\d+)-(\d+)/gimu, (match, first, second) => String(_.random(first, second)))
      .replace(/\$subs\.last\.sub\.username/gimu, twitch.channelMetaData.latestSubscriber?.username + ' ')
      .replace(/\$subs\.last\.sub\.ago/gimu, hd(Date.now() - twitch.channelMetaData.latestSubscriber?.timestamp, {
        units: ['mo', 'd', 'h', 'm'],
        round: true,
        language: locales.translate('lang.code'),
      }) + ' ')
      .replace(/\$subs\.last\.sub\.tier/gimu, twitch.channelMetaData.latestSubscriber?.tier + ' ')
      .replace(/\$subs\.last\.resub\.username/gimu, twitch.channelMetaData.latestReSubscriber?.username + ' ')
      .replace(/\$subs\.last\.resub\.ago/gimu, hd(Date.now() - twitch.channelMetaData.latestReSubscriber?.timestamp, {
        units: ['mo', 'd', 'h', 'm'],
        round: true,
        language: locales.translate('lang.code'),
      }) + ' ')
      .replace(/\$subs\.last\.resub\.tier/gimu, twitch.channelMetaData.latestReSubscriber?.tier + ' ')
      .replace(/\$subs\.last\.resub\.months/gimu, String(twitch.channelMetaData.latestReSubscriber?.months) + ' ')
      .replace(/\$subs\.last\.resub\.overallMonths/gimu, String(twitch.channelMetaData.latestReSubscriber?.overallMonths) + ' ')
      .replace(/\$subs/gimu, String(twitch.channelMetaData.subs) + ' ')

    if (/\$followage/gimu.test(result)) {
      result = result.replace(/\$followage/gimu, userInfo ? await twitch.getFollowAge(userInfo.userId) : 'invalid')
    }

    if (/\$song/gimu.test(result)) {
      result = result.replace(/\$song/gimu, await this.getSong())
    }

    if (/\$commands/gimu.test(result)) {
      result = result.replace(/\$commands/gimu, Commands.getCommandList().join(', '))
    }

    if (/\$prices/gimu.test(result)) {
      result = result.replace(/\$prices/gimu, Commands.getPricesList().map(c => `${c.name} — ${c.price}`).join(', '))
    }

    if (/\$top\.points/gimu.test(result)) {
      result = result.replace(/\$top\.points/gimu, await this.getTop('points', opts.argument))
    }

    if (/\$top\.bits/gimu.test(result)) {
      result = result.replace(/\$top\.bits/gimu, await this.getTop('bits', opts.argument))
    }

    if (/\$top\.tips/gimu.test(result)) {
      result = result.replace(/\$top\.tips/gimu, await this.getTop('tips', opts.argument))
    }

    if (/\$top\.time/gimu.test(result)) {
      result = result.replace(/\$top\.time/gimu, await this.getTop('watched', opts.argument))
    }

    if (/\$top\.messages\.today/gimu.test(result)) {
      result = result.replace(/\$top\.messages\.today/gimu, await this.getTop('messages.today', opts.argument))
    }

    if (/\$top\.messages/gimu.test(result)) {
      result = result.replace(/\$top\.messages/gimu, await this.getTop('messages', opts.argument))
    }

    if (/(\(eval)(.*)(\))/gimu.test(result)) {
      const toEval = result.match(/(\(eval)(.*)(\))/)[2].trim()
      result = result.replace(/(\(eval)(.*)(\))/gimu, await evaluate({ raw: opts.raw, param: opts.argument, message: toEval }))
    }

    if (/\$command\.stats\.used/gimu.test(result)) {
      result = result.replace(/\$command\.stats\.used/gimu, String(opts.command?.usage ?? 'unknown'))
    }

    if (/\$faceit\.[a-z]{3}/gimu.test(result)) {
      const faceitData = await satontapi.getFaceitData()
      if (faceitData) result = result
        .replace(/\$faceit\.elo/, String(faceitData.elo))
        .replace(/\$faceit\.lvl/, String(faceitData.lvl))
    }

    if (/\$_[0-9a-z]+/gimu.test(result)) {
      result = await this.parseCustomVariables(result)
    }

    if (includesOneOf(result, ['user.messages', 'user.tips', 'user.bits', 'user.watched', 'user.points', 'user.daily.messages']) && userInfo) {
      const user = await users.getUserStats({ id: userInfo?.userId })

      result = result
        .replace(/\$user\.messages/gimu, String(user.messages))
        .replace(/\$user\.watched/gimu, user.watchedFormatted)
        .replace(/\$user\.tips/gimu, String(user.totalTips))
        .replace(/\$user\.bits/gimu, String(user.totalBits))
        .replace(/\$user\.points/gimu, String(user.points))
        .replace(/\$user\.daily\.messages/gimu, String(user.todayMessages))
    }

    if (result.includes('(api|')) {
      result = await this.makeApiRequest(result)
    }

    return result
  }

  async getTop(type: 'watched' | 'tips' | 'bits' | 'messages' | 'messages.today' | 'points', page = '1') {
    let result: Array<{ username: string, value: number }> = []
    if (isNaN(Number(page))) page = '1'
    if (Number(page) <= 0) page = '1'

    const offset = (Number(page) - 1) * 10

    const ignored = [...users.settings.ignoredUsers, tmi.channel?.name.toLowerCase(), tmi.chatClients?.bot?.currentNick ].filter(Boolean)
    const limit = 10

    if (type === 'watched') {
      result = (await orm.em.getRepository(UserModel).find({
        username: { $nin: ignored },
      }, { 
        limit, 
        orderBy: { [type]: 'DESC' },
        offset,
      })).map(user => ({ username: user.username, value: user[type] }))

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${((result.value / (1 * 60 * 1000)) / 60).toFixed(1)}h`).join(', ')
    } else if (type === 'messages') {
      result = (await orm.em.getRepository(UserModel).find({
        username: { $nin: ignored },
      }, { 
        limit, 
        orderBy: { [type]: 'DESC' },
        offset,
      })).map(user => ({ username: user.username, value: user[type] }))

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ')
    } else if (type === 'tips') {
      const qb: QueryBuilder<UserModel> = (orm.em as any).createQueryBuilder(UserModel, 'user')

      const result: Array<{ id: number, username: string, value: number }> = await orm.em.getConnection().execute(qb
        .select(['user.id', 'user.username'])
        .where({ username: { $nin: ignored } })
        .join('user.tips', 'tips')
        .addSelect('COALESCE(SUM("userTips"."inMainCurrencyAmount"), 0) as "value"')
        .offset(offset)
        .limit(limit)
        .groupBy('id')
        .getKnexQuery()
        .orderBy('value', 'desc')
        .toQuery())

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}${currency.botCurrency}`).join(', ')
    } else if (type === 'bits') {
      const qb: QueryBuilder<UserModel> = (orm.em as any).createQueryBuilder(UserModel, 'user')

      const result: Array<{ id: number, username: string, value: number }> = await orm.em.getConnection().execute(qb
        .select(['user.id', 'user.username'])
        .where({ username: { $nin: ignored } })
        .join('user.bits', 'bits')
        .addSelect('COALESCE(SUM("userBits"."amount"), 0) as "value"')
        .offset(offset)
        .limit(limit)
        .groupBy('id')
        .getKnexQuery()
        .orderBy('value', 'desc')
        .toQuery())

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ')
    } else if (type === 'messages.today') {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      result = (await orm.em.getRepository(UserDailyMessages).find({
        date: startOfDay.getTime(),
      }, {
        limit,
        orderBy: { count: 'desc' },
        offset,
        populate: ['user'],
      })).map(daily => ({ username: daily.user.username, value: daily.count }))

      return (result as any).map((item: UserDailyMessages, index: number) => `${index + 1 + offset}. ${item.user.username} - ${item.count}`).join(', ')
    } if (type === 'points') {
      result = (await orm.em.getRepository(UserModel).find({
        username: { $nin: ignored },
      }, { 
        limit, 
        orderBy: { [type]: 'DESC' },
        offset,
      })).map(user => ({ username: user.username, value: user[type] }))

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ')
    } else {
      return 'unknown type of top'
    }
  }

  async makeApiRequest(result: string) {
    const match = result.match(/\((api)\|(POST|GET)\|(\S+)\)/)
    if (match.length) {
      // '(api|GET|https://qwe.ru)' = ["(api|GET|https://qwe.ru)", "api", "GET", "https://qwe.ru", index: 0, input: "(api|GET|https://qwe.ru)", groups: undefined]
      result = result.replace(match[0], '')
      const method: 'GET' | 'POST' = match[2] as any
      const url = match[3]

      try {
        let { data } = await Axios({ method, url })
        // search for api datas in message
        const rData = result.match(/\(api\.(?!_response)(\S*?)\)/gi)
        if (_.isNil(rData)) {
          if (_.isObject(data)) {
            // Stringify object
            result = result.replace('(api._response)', JSON.stringify(data))
          } else {
            result = result.replace('(api._response)', data.toString().replace(/^"(.*)"/, '$1')) 
          }
        } else {
          if (_.isBuffer(data)) {
            data = JSON.parse(data.toString()) 
          }
          for (const tag of rData) {
            let path = data
            const ids = tag.replace('(api.', '').replace(')', '').split('.')
            _.each(ids, function (id) {
              const isArray = id.match(/(\S+)\[(\d+)\]/i)
              if (isArray) {
                path = path[isArray[1]][isArray[2]]
              } else {
                path = path[id]
              }
            })
            result = result.replace(tag, !_.isNil(path) ? path : 'possible you parsing api wrong')
          }
        }

        return result
      } catch (e) {
        return `error: ${e.message}`
      }
    } else return result
  }

  async parseCustomVariables(result: string) {
    for (const variable of this.variables.filter(v => v.custom)) {
      const match = result.match(new RegExp(`\\${variable.name}`))
      if (!match) continue
      result = result.replace(match[0], variable.response)
    }

    return result
  }

  async changeCustomVariable({ raw, text, response }: { raw: TwitchPrivateMessage, response: string, text: string }) {
    const isAdmin = users.hasPermission(raw.userInfo.badges, CommandPermission.MODERATORS, raw)

    if (isAdmin && text.length) {
      const match = response.match(/\$_(\S*)/g)
      if (match) {
        const variable = await orm.em.getRepository(Variable).findOne({ name: this.variables.find(v => v.name === match[0].replace('$_', '')).name }) 
        variable.response = text 
        await orm.em.persistAndFlush(variable)
        tmi.say({ message: `@${raw.userInfo.userName} ✅` })
        return true
      } else return false
    } else return false
  }

  async getSong() {
    const [spotifySong, satontApiSong] = await Promise.all([
      spotify.getSong(),
      satontapi.getSong(),
    ])
    
    return spotifySong || satontApiSong || locales.translate('song.notPlaying')
  }
}
