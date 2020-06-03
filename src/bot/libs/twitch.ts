import tmi from "./tmi"
import humanizeDuration from 'humanize-duration'

export default new class Twitch {
  streamMetaData: {
    viewers: number,
    game: string,
    title: string,
    startedAt: Date
  } = {
    viewers: 0,
    game: 'No data',
    title: 'No data',
    startedAt: null
  }

  channelMetaData: {
    views: number
  } = {
    views: 0
  }

  constructor() {
    this.getStreamData()
    this.getChannelData()
  }

  private async getStreamData() {
    const data = await tmi?.clients?.bot?.helix.streams.getStreamByUserId(tmi.channel.id)

    this.streamMetaData = {
      viewers: data?.viewers ?? 0,
      game: (await data?.getGame())?.name ?? 'No data',
      title: data?.title ?? 'No data',
      startedAt: data?.startDate ?? null
    }

    setTimeout(() => this.getStreamData(), 1 * 60 * 1000)
  }

  private async getChannelData() {
    const data = await tmi?.clients?.bot?.helix.users.getUserById(tmi.channel.id)

    this.channelMetaData = {
      views: data?.views ?? 0
    }

    setTimeout(() => this.getChannelData(), 1 * 60 * 1000)
  }

  async getFollowAge(userId: string) {
    const follow = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel.id, user: userId })
    if (!follow.total) return 'not follower'

    return humanizeDuration(Date.now() - new Date(follow.data[0].followDate).getTime(), { units: ['y', 'mo', 'd', 'h', 'm'], round: true })
  }

  getUptime() {
    if (!this.streamMetaData?.startedAt) return 'offline'

    return humanizeDuration(Date.now() - new Date(this.streamMetaData?.startedAt).getTime(), { units: ['mo', 'd', 'h', 'm', 's'], round: true })
  }
}