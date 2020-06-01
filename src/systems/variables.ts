import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import tmi from '../libs/tmi'
import moment from 'moment'
import humanizeDuration from 'humanize-duration'

export default new class Variables {
  async parseMessage(message: string, raw: TwitchPrivateMessage) {
    let result = message

    result = result
      .replace(/\$sender/gimu, '@' + raw.userInfo.userName)
      .replace(/\$followage/gimu, await this.getFollowAge(raw.userInfo.userId))

    return result
  }

  async getFollowAge(userId: string) {
    const follow = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel.id, user: userId })
    if (!follow.total) return 'not follower'

    return humanizeDuration(Date.now() - new Date(follow.data[0].followDate).getTime(), { units: ['y', 'mo', 'd', 'h', 'm'], round: true })
  }
}
