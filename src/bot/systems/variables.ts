import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import _ from 'lodash'

import twitch from './twitch'
import includesOneOf from '../commons/includesOneOf'
import users from './users'
import tmi from '../libs/tmi'
import UserModel from '../models/User'
import { sequelize } from '../libs/db'
import currency from '../libs/currency'
import Axios from 'axios'
import { System } from 'typings'
import Variable from '../models/Variable'
import spotify from '../integrations/spotify'
import locales from '../libs/locales'

export default new class Variables implements System {
  variables: Variable[] = []

  async init() {
    this.variables = await Variable.findAll()
  }

  async parseMessage(opts: { message: string, raw?: TwitchPrivateMessage }) {
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
      result = await this.getSong(result)
    }

    if (/\$top\.bits/gimu.test(result)) {
      result = result.replace(/\$top\.bits/gimu, await this.getTop('bits'))
    }

    if (/\$top\.tips/gimu.test(result)) {
      result = result.replace(/\$top\.tips/gimu, await this.getTop('tips'))
    }

    if (/\$top\.time/gimu.test(result)) {
      result = result.replace(/\$top\.time/gimu, await this.getTop('watched'))
    }

    if (/\$top\.messages/gimu.test(result)) {
      result = result.replace(/\$top\.messages/gimu, await this.getTop('messages'))
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

  async getTop(type: 'watched' | 'tips' | 'bits' | 'messages') {
    let result: Array<{ username: string, value: number }> = []

    if (type === 'watched') {
      result = await UserModel.findAll({ limit: 10, order: [[type, 'DESC']], attributes: ['username', [type, 'value']], raw: true })

      return result.map((result, index) => `${index + 1}. ${result.username} - ${((result.value / (1 * 60 * 1000)) / 60).toFixed(1)}h`).join(', ')
    } else if (type === 'messages') {
      result = await UserModel.findAll({ limit: 10, order: [[type, 'DESC']], attributes: ['username', [type, 'value']], raw: true })

      return result.map((result, index) => `${index + 1}. ${result.username} - ${result.value}`).join(', ')
    } else if (type === 'tips') {
      const query = await sequelize.query(`
        SELECT 
          "users"."id", 
          "users"."username", 
          (SUM("users_tips"."inMainCurrencyAmount")) AS "value" 
        FROM 
          "users"
          INNER JOIN "users_tips" ON "users"."id" = "users_tips"."userId"
        GROUP BY 
          "users"."id" 
        ORDER BY 
          value DESC 
        LIMIT 
          10`)
      result = query[0]
      
      return result.map((result, index) => `${index + 1}. ${result.username} - ${result.value}${currency.botCurrency}`).join(', ')
    } else if (type === 'bits') {
      const query = await sequelize.query(`
        SELECT 
          "users"."id", 
          "users"."username", 
          (SUM("users_bits"."amount")) AS "value" 
        FROM 
          "users"
          INNER JOIN "users_bits" ON "users"."id" = "users_bits"."userId"
        GROUP BY 
          "users"."id" 
        ORDER BY 
          value DESC 
        LIMIT 
          10`)
      result = query[0]
      return result.map((result, index) => `${index}. ${result.username} - ${result.value}`).join(', ')
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

  async getSong(result) {
    const spotifySong = await spotify.getSong()
    if (spotifySong) return result.replace(/\$song/gimu, spotifySong)
    else return result.replace(/\$song/gimu, locales.translate('song.notPlaying'))
  }

  listenDbUpdates() {
    Variable.afterSave(() => this.init())
    Variable.afterDestroy(() => this.init())
  }
}
