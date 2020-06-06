import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { random } from 'lodash'

import twitch from '../libs/twitch'
import includesOneOf from '../commons/includesOneOf'
import users from './users'
import tmi from '../libs/tmi'
import UserModel from '../models/User'
import { sequelize } from '../libs/db'
import currency from '../libs/currency'

export default new class Variables {
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
      .replace(/\$random\.(\d)-(\d)/gimu, (match, first, second) => String(random(first, second)))


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

    if (includesOneOf(result, ['user.messages', 'user.tips', 'user.bits', 'user.watched']) && userInfo) {
      const user = await users.getUserStats({ id: userInfo?.userId })

      result = result
        .replace(/\$user\.messages/gimu, String(user.messages))
        .replace(/\$user\.watched/gimu, `${((user.watched / (1 * 60 * 1000)) / 60).toFixed(1)}h`)
        .replace(/\$user\.tips/gimu, String(user.totalTips))
        .replace(/\$user\.bits/gimu, String(user.totalBits))
    }

    return result
  }

  async getTop(type: 'watched' | 'tips' | 'bits' | 'messages') {
    let result: Array<{ username: string, value: number }> = []

    if (type === 'watched') {
      result = await UserModel.findAll({ limit: 10, order: [[type, 'DESC']], attributes: ['username', [type, 'value']] })

      return result.map((result, index) => `${index + 1}. ${result.username} - ${((result.value / (1 * 60 * 1000)) / 60).toFixed(1)}h}`).join(', ')
    } else if (type === 'messages') {
      result = await UserModel.findAll({ limit: 10, order: [[type, 'DESC']], attributes: ['username', [type, 'value']] })

      return result.map((result, index) => `${index + 1} ${result.username} - ${result.value}`).join(', ')
    } else if (type === 'tips') {
      const query = await sequelize.query(`
        SELECT 
          "users"."id", 
          "users"."username", 
          COALESCE(
            SUM("users_tips"."inMainCurrencyAmount"), 
            0
          ) AS "value" 
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
          COALESCE(
            SUM("users_bits"."amount"), 
            0
          ) AS "value" 
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
}
