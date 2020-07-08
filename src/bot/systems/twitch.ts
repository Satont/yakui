import tmi from "@bot/libs/tmi"
import humanizeDuration from 'humanize-duration'
import { onStreamStart, onStreamEnd } from "@bot/libs/eventsCaller"
import locales from '@bot/libs/locales'
import { System, Command, CommandOptions } from "typings"
import { INewSubscriber, INewResubscriber } from "typings/events"
import Settings from "@bot/models/Settings"
import { info } from "@bot/libs/logger"

export default new class Twitch implements System {
  private intervals = {
    streamData: null,
    channelData: null,
    subscribers: null,
  }
  commands: Command[] = [
    {
      name: 'title',
      fnc: this.setTitle,
      permission: 'moderators',
      visible: false,
      description: 'Set title of channel.'
    },
    {
      name: 'category',
      fnc: this.setGame,
      aliases: ['game'],
      permission: 'moderators',
      visible: false,
      description: 'Set category of channel'
    }
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
    subs?: number,
    latestSubscriber?: {
      username: string,
      tier: string,
      timestamp: number,
    },
    latestReSubscriber?: {
      username: string,
      tier: string,
      months: number,
      overallMonths: number,
      timestamp: number,
    }
  } = {
    views: 0,
    game: 'No data',
    title: 'No data',
    subs: 0,
    latestSubscriber: {
      username: 'No data',
      tier: 'No data',
      timestamp: undefined,
    },
    latestReSubscriber: {
      username: 'No data',
      tier: 'No data',
      months: 0,
      overallMonths: 0,
      timestamp: undefined,
    },
  }

  async init() {
    const [latestSubscriber, latestReSubscriber] = await Promise.all([
      Settings.findOne({ where: { space: 'twitch', name: 'latestSubscriber' } }),
      Settings.findOne({ where: { space: 'twitch', name: 'latestReSubscriber' } })
    ])

    if (latestSubscriber) this.channelMetaData.latestSubscriber = latestSubscriber.value
    if (latestReSubscriber) this.channelMetaData.latestReSubscriber = latestReSubscriber.value

    this.getStreamData()
    this.getChannelData()
    this.getChannelSubscribers()
  }

  private async getStreamData() {
    clearInterval(this.intervals.streamData)
    this.intervals.streamData = setTimeout(() => this.getStreamData(), 1 * 60 * 1000)
    if (!tmi.channel?.id) return

    const data = await tmi?.clients?.bot?.helix.streams.getStreamByUserId(tmi.channel?.id)

    if (data && !this.streamMetaData.startedAt) onStreamStart()
    else if (!data && this.streamMetaData.startedAt) onStreamEnd()

    this.streamMetaData = {
      viewers: data?.viewers ?? 0,
      startedAt: data?.startDate ?? null
    }
  }

  private async getChannelData() {
    clearInterval(this.intervals.channelData)
    this.intervals.channelData = setTimeout(() => this.getChannelData(), 1 * 60 * 1000)
    if (!tmi.channel?.id) return

    const channel = await tmi?.clients?.bot?.kraken.users.getUser(tmi.channel?.id)
    if (!channel) return

    const data = await (await tmi?.clients?.bot?.kraken.users.getUser(tmi.channel?.id)).getChannel()

    this.channelMetaData.views = data?.views ?? 0,
    this.channelMetaData.game = data?.game ?? 'No data',
    this.channelMetaData.title = data?.status ?? 'No data'
  }

  private async getChannelSubscribers() {
    clearInterval(this.intervals.subscribers)
    this.intervals.subscribers = setTimeout(() => this.getChannelSubscribers(), 1 * 60 * 1000)

    if (!tmi.clients.broadcaster || !tmi.channel?.id) return;
    const data = await (await tmi.clients.broadcaster.helix.subscriptions.getSubscriptionsPaginated(tmi.channel?.id)).getAll()
    this.channelMetaData.subs = data.length - 1 || 0
  }

  async getFollowAge(userId: string) {
    const follow = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel?.id, user: userId })
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

  async onSubscribe(data: INewSubscriber) {
    const value = { username: data.username, tier: data.tier, timestamp: Date.now() }
    this.channelMetaData.latestSubscriber = value

    const [instance, created]: [Settings, boolean] = await Settings.findOrCreate({
      where: { space: 'twitch', name: 'latestSubscriber' },
      defaults: { value },
    })

    if (!created) {
      await instance.update({ value })
    }
  }

  async onReSubscribe(data: INewResubscriber) {
    const value = { username: data.username, tier: data.tier, timestamp: Date.now(), months: data.months, overallMonths: data.overallMonths }
    this.channelMetaData.latestReSubscriber = value

    const [instance, created]: [Settings, boolean] = await Settings.findOrCreate({
      where: { space: 'twitch', name: 'latestReSubscriber' },
      defaults: { value },
    })

    if (!created) {
      await instance.update({ value })
    }
  }
}
