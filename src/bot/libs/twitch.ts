import tmi from "./tmi"
import humanizeDuration from 'humanize-duration'
import { onStreamStart, onStreamEnd } from "./eventsCaller"
import locales from './locales'

export default new class Twitch {
  streamMetaData: {
    viewers: number,
    startedAt: Date
  } = {
    viewers: 0,
    startedAt: null
  }

  channelMetaData: {
    views: number,
    game: string,
    title: string,
  } = {
    views: 0,
    game: 'No data',
    title: 'No data'
  }

  constructor() {
    this.getStreamData()
    this.getChannelData()
  }

  private async getStreamData() {
    setTimeout(() => this.getStreamData(), 1 * 60 * 1000)

    const data = await tmi?.clients?.bot?.helix.streams.getStreamByUserId(tmi.channel.id)

    if (data && !this.streamMetaData.startedAt) onStreamStart()
    else if (!data && this.streamMetaData.startedAt) onStreamEnd()

    this.streamMetaData = {
      viewers: data?.viewers ?? 0,
      startedAt: data?.startDate ?? null
    }
  }

  private async getChannelData() {
    setTimeout(() => this.getChannelData(), 1 * 60 * 1000)
    
    const channel = await tmi?.clients?.bot?.kraken.users.getUser(tmi.channel.id)
    if (!channel) return
    
    const data = await (await tmi?.clients?.bot?.kraken.users.getUser(tmi.channel.id)).getChannel()
  
    this.channelMetaData = {
      views: data?.views ?? 0,
      game: data?.game ?? 'No data',
      title: data?.status ?? 'No data'
    }
  }

  async getFollowAge(userId: string) {
    const follow = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel.id, user: userId })
    if (!follow.total) return 'not follower'

    return humanizeDuration(Date.now() - new Date(follow.data[0].followDate).getTime(), { 
      units: ['y', 'mo', 'd', 'h', 'm'],
      round: true,
      language: locales.translate('lang.code')
    })
  }

  get uptime() {
    if (!this.streamMetaData?.startedAt) return 'offline'

    return humanizeDuration(Date.now() - new Date(this.streamMetaData?.startedAt).getTime(), { 
      units: ['mo', 'd', 'h', 'm', 's'],
      round: true,
      language: locales.translate('lang.code')
    })
  }
}
