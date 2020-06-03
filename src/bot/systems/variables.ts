import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { random } from 'lodash'

import twitch from '../libs/twitch'
import includesOneOf from '../commons/includesOneOf'
import users from './users'

export default new class Variables {
  async parseMessage(opts: { message: string, raw: TwitchPrivateMessage }) {
    let result = opts.message

    result = result
      .replace(/\$sender/gimu, '@' + opts.raw?.userInfo.userName)
      .replace(/\$followage/gimu, await twitch.getFollowAge(opts.raw?.userInfo.userId))
      .replace(/\$stream\.viewers/gimu, String(twitch.streamMetaData?.viewers ?? 0))
      .replace(/\$channel\.views/gimu, String(twitch.channelMetaData?.views ?? 0))
      .replace(/\$channel\.game/gimu, twitch.streamMetaData?.game)
      .replace(/\$channel\.title/gimu, twitch.streamMetaData?.title)
      .replace(/\$stream\.uptime/gimu, twitch.getUptime())
      .replace(/\$random\.(\d)-(\d)/gimu, (match, first, second) => String(random(first, second)))

    if (includesOneOf(result, ['user.messages', 'user.tips', 'user.bits', 'user.watched'])) {
      const user = await users.getUserStats({ id: opts.raw?.userInfo.userId })

      result = result
        .replace(/\$user\.messages/gimu, String(user.messages))
        .replace(/\$user\.watched/gimu, `${((user.watched / (1 * 60 * 1000)) / 60).toFixed(1)}h`)
        .replace(/\$user\.tips/gimu, String(user.totalTips))
        .replace(/\$user\.bits/gimu, String(user.totalBits))
    }

    return result
  }
}
