import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import tmi from '../libs/tmi'
import humanizeDuration from 'humanize-duration'
import twitch from '../libs/twitch'

export default new class Variables {
  async parseMessage(message: string, raw?: TwitchPrivateMessage) {
    let result = message

    result = result
      .replace(/\$sender/gimu, '@' + raw?.userInfo.userName)
      .replace(/\$followage/gimu, await twitch.getFollowAge(raw?.userInfo.userId))
      .replace(/\$viewers/gimu, String(twitch.streamMetaData?.viewers ?? 0))
      .replace(/\$views/gimu, String(twitch.channelMetaData?.views ?? 0))
      .replace(/\$game/gimu, twitch.streamMetaData?.game)
      .replace(/\$title/gimu, twitch.streamMetaData?.title)
      .replace(/\$uptime/gimu, twitch.getUptime())

    return result
  }
}
