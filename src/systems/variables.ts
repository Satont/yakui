import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import tmi from '../libs/tmi'
import humanizeDuration from 'humanize-duration'
import Cache from '../libs/cache'

export default new class Variables {
  async parseMessage(message: string, raw?: TwitchPrivateMessage) {
    let result = message

    result = result
      .replace(/\$sender/gimu, '@' + raw?.userInfo.userName)
      .replace(/\$followage/gimu, await this.getFollowAge(raw?.userInfo.userId))
      .replace(/\$viewers/gimu, String(Cache.streamMetaData?.viewers ?? 0))
      .replace(/\$views/gimu, String(Cache.channelMetaData?.views ?? 0))
      .replace(/\$game/gimu, Cache.streamMetaData?.game)
      .replace(/\$title/gimu, Cache.streamMetaData?.title)
      .replace(/\$uptime/gimu, this.getUptime())

    return result
  }

  private async getFollowAge(userId: string) {
    const follow = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel.id, user: userId })
    if (!follow.total) return 'not follower'

    return humanizeDuration(Date.now() - new Date(follow.data[0].followDate).getTime(), { units: ['y', 'mo', 'd', 'h', 'm'], round: true })
  }

  private getUptime() {
    if (!Cache.streamMetaData?.startedAt) return 'offline'

    return humanizeDuration(Date.now() - new Date(Cache.streamMetaData?.startedAt).getTime(), { units: ['mo', 'd', 'h', 'm', 's'], round: true })
  }
}
