import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { random } from 'lodash'

import twitch from '../libs/twitch'
import includesOneOf from '../commons/includesOneOf'
import users from './users'
import tmi from '../libs/tmi'

export default new class Variables {
  async parseMessage(opts: { message: string, raw?: TwitchPrivateMessage }) {
    let result = opts.message
    const userInfo = opts.raw?.userInfo

    result = result
      .replace(/\$sender/gimu, '@' + userInfo.userName ?? tmi.chatClients?.bot?.currentNick)
      .replace(/\$followage/gimu, userInfo ? await twitch.getFollowAge(userInfo.userId) : 'invalid')
      .replace(/\$stream\.viewers/gimu, String(twitch.streamMetaData?.viewers ?? 0))
      .replace(/\$channel\.views/gimu, String(twitch.channelMetaData?.views ?? 0))
      .replace(/\$channel\.game/gimu, twitch.streamMetaData?.game)
      .replace(/\$channel\.title/gimu, twitch.streamMetaData?.title)
      .replace(/\$stream\.uptime/gimu, twitch.uptime)
      .replace(/\$random\.(\d)-(\d)/gimu, (match, first, second) => String(random(first, second)))

    if (includesOneOf(result, ['user.messages', 'user.tips', 'user.bits', 'user.watched']) && userInfo) {
      const user = await users.getUserStats({ id: userInfo.userId })

      result = result
        .replace(/\$user\.messages/gimu, String(user.messages))
        .replace(/\$user\.watched/gimu, `${((user.watched / (1 * 60 * 1000)) / 60).toFixed(1)}h`)
        .replace(/\$user\.tips/gimu, String(user.totalTips))
        .replace(/\$user\.bits/gimu, String(user.totalBits))
    }

    return result
  }
}
