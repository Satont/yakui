import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import _ from 'lodash'

import twitch from './twitch'
import includesOneOf from '@bot/commons/includesOneOf'
import users from './users'
import tmi from '@bot/libs/tmi'
import UserModel from '@bot/models/User'
import { sequelize } from '@bot/libs/db'
import { Op } from 'sequelize'
import currency from '@bot/libs/currency'
import Axios from 'axios'
import { System } from 'typings'
import Variable from '@bot/models/Variable'
import spotify from '@bot/integrations/spotify'
import locales from '@bot/libs/locales'
import { loadedSystems } from '@bot/libs/loader'
import evaluate from '@bot/commons/eval'
import satontapi from '@bot/integrations/satontapi'

export default new class Variables implements System {
  variables: Variable[] = []

  async init() {
    this.variables = await Variable.findAll()
  }

  async parseMessage(opts: { message: string, raw?: TwitchPrivateMessage, argument?: string }) {
    let result = opts.message
    const userInfo = opts.raw?.userInfo
    result = result
      .replace(/\$sender/gimu, '@' + userInfo?.userName ?? tmi.chatClients?.bot?.currentNick)
      .replace(/\$followage/gimu, userInfo ? await twitch.getFollowAge(userInfo.userId) : 'invalid')
      .replace(/\$stream\.viewers/gimu, String(twitch.streamMetaData.viewers))
      .replace(/\$channel\.views/gimu, String(twitch.channelMetaData.views))
      .replace(/\$channel\.game/gimu, twitch.channelMetaData.game)
      .replace(/\$channel\.title/gimu, twitch.channelMetaData.title)
      .replace(/\$stream\.uptime/gimu, twitch.uptime)
      .replace(/\$random\.(\d+)-(\d+)/gimu, (match, first, second) => String(_.random(first, second)))

    if (/\$song/gimu.test(result)) {
      result = result.replace(/\$song/gimu, await this.getSong(result))
    }

    if (/\$commands/gimu.test(result)) {
      result = result.replace(/\$commands/gimu, this.getCommandList(result).join(', '))
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

    if (/\$top\.messages/gimu.test(result)) {
      result = result.replace(/\$top\.messages/gimu, await this.getTop('messages', opts.argument))
    }

    if (/(\(eval)(.*)(\))/gimu.test(result)) {
      const toEval = result.match(/(\(eval)(.*)(\))/)[2].trim()
      result = result.replace(/(\(eval)(.*)(\))/gimu, await evaluate({ raw: opts.raw, param: opts.argument, message: toEval }))
    }

    if (/\$faceit\.[a-z]{3}/gimu.test(result)) {
      const faceitData = await satontapi.getFaceitData()
      if (faceitData) result = result
          .replace(/\$faceit\.elo/, String(faceitData.elo))
          .replace(/\$faceit\.lvl/, String(faceitData.lvl))
    }

    result = await this.parseCustomVariables(result)

    if (includesOneOf(result, ['user.messages', 'user.tips', 'user.bits', 'user.watched']) && userInfo) {
      const user = await users.getUserStats({ id: userInfo?.userId })

      result = result
        .replace(/\$user\.messages/gimu, String(user.messages))
        .replace(/\$user\.watched/gimu, `${((user.watched / (1 * 60 * 1000)) / 60).toFixed(1)}h`)
        .replace(/\$user\.tips/gimu, String(user.totalTips))
        .replace(/\$user\.bits/gimu, String(user.totalBits))
    }

    if (result.includes('(api|')) {
      result = await this.makeApiRequest(result)
    }

    return result
  }

  async getTop(type: 'watched' | 'tips' | 'bits' | 'messages', page: string = '1') {
    let result: Array<{ username: string, value: number }> = []
    if (isNaN(Number(page))) page = '1'
    if (Number(page) <= 0) page = '1'

    const offset = (Number(page) - 1) * 10

    const ignored = [...users.settings.ignoredUsers, tmi.channel.name.toLowerCase()]
    const limit = 10

    if (type === 'watched') {
      result = await UserModel.findAll({ 
        limit,
        where: { username: { [Op.notIn]: ignored } },
        order: [[type, 'DESC']],
        attributes: ['username',
        [type, 'value']],
        offset,
        raw: true
      })

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${((result.value / (1 * 60 * 1000)) / 60).toFixed(1)}h`).join(', ')
    } else if (type === 'messages') {
      result = await UserModel.findAll({ 
        limit,
        where: { username: { [Op.notIn]: ignored } },
        order: [[type, 'DESC']],
        attributes: ['username', [type, 'value']],
        offset,
        raw: true
      })

      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ')
    } else if (type === 'tips') {
      const query = await sequelize.query(`
        SELECT 
          "users"."id", 
          "users"."username", 
          (SUM("users_tips"."inMainCurrencyAmount")) AS "value"
        FROM 
          "users"
        INNER JOIN "users_tips" ON "users"."id" = "users_tips"."userId"
        WHERE "users"."username" NOT IN(:usernames)
        GROUP BY 
          "users"."id" 
        ORDER BY 
          value DESC
        OFFSET ${offset} ROWS
        LIMIT 
          ${limit}`, {
            replacements: { usernames: ignored }
          })
      result = query[0]
      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}${currency.botCurrency}`).join(', ')
    } else if (type === 'bits') {
      const query = await sequelize.query(`
        SELECT 
          "users"."id", 
          "users"."username", 
          (SUM("users_bits"."amount")) AS "value" 
        FROM 
          "users"
          INNER JOIN "users_bits" ON "users"."id" = "users_bits"."userId"
        WHERE "users"."username" NOT IN(:usernames)
        GROUP BY 
          "users"."id" 
        ORDER BY 
          value DESC
        OFFSET ${offset} ROWS
        LIMIT 
        ${limit}`, {
          replacements: { usernames: ignored }
        })

      result = query[0]
      return result.map((result, index) => `${index + 1 + offset}. ${result.username} - ${result.value}`).join(', ')
    } else {
      return 'unknown type'
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
          } else { result = result.replace('(api._response)', data.toString().replace(/^"(.*)"/, '$1')) };
        } else {
          if (_.isBuffer(data)) { data = JSON.parse(data.toString()) };
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
    for (const variable of this.variables) {
      const match = result.match(new RegExp(`\\$_${variable.name}`))
      if (!match) continue

      result = result.replace(match[0], variable.response)
    }

    return result
  }

  async changeCustomVariable({ raw, text, response }: { raw: TwitchPrivateMessage, response: string, text: string }) {
    const isAdmin = users.hasPermission(raw.userInfo.badges, 'moderators') || users.hasPermission(raw.userInfo.badges, 'broadcaster')

    if (isAdmin && text.length) {
      const match = response.match(/\$_(\S*)/g)
      if (match) {
        const variable = this.variables.find(v => v.name === match[0].replace('$_', ''))
        await variable.update({ response: text })
        tmi.say({ message: `@${raw.userInfo.userName} ✅` })
        return true;
      } else return false
    } else return false
  }

  async getSong(result: string) {
    const spotifySong = await spotify.getSong()
    const satontSong = await satontapi.getSong()
    if (spotifySong) return spotifySong
    else if (satontSong) return satontSong
    else return locales.translate('song.notPlaying')
  }

  getCommandList(result: string) {
    const commands = _.flatten(loadedSystems
      .map(system => system.commands?.filter(c => c.visible ?? true).map(c => c.name)))

    return commands.filter(Boolean)
  }

  listenDbUpdates() {
    Variable.afterSave(() => this.init())
    Variable.afterDestroy(() => this.init())
  }
}
