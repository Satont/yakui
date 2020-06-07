import tmi from "@bot/libs/tmi"
import humanizeDuration from 'humanize-duration'
import { onStreamStart, onStreamEnd } from "@bot/libs/eventsCaller"
import locales from '@bot/libs/locales'
import { System, Command, CommandOptions } from "typings"

export default new class Twitch implements System {
  commands: Command[] = [
    { name: 'title', fnc: this.setTitle, permission: 'moderators', visible: false, },
    { name: 'game', fnc: this.setGame, permission: 'moderators', visible: false }
  ]

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

  async setTitle(opts: CommandOptions) {
    if (!opts.argument.trim().length) return

    await tmi.clients?.bot?.kraken.channels.updateChannel(tmi.channel?.id, {
      status: opts.argument
    })

    return '$sender ✅'
  }

  async setGame(opts: CommandOptions) {
    if (!opts.argument.trim().length) return

    const suggestedGame = await tmi.clients?.bot?.helix.games.getGameByName(opts.argument)

    await tmi.clients?.bot?.kraken.channels.updateChannel(tmi.channel?.id, {
      game: suggestedGame.name
    })

    return '$sender ✅'
  }
}
