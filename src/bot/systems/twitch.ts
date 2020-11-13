import tmi from '@bot/libs/tmi'
import humanizeDuration from 'humanize-duration'
import { onStreamStart, onStreamEnd } from '@bot/libs/eventsCaller'
import locales from '@bot/libs/locales'
import { System, CommandOptions } from 'typings'
import { INewSubscriber, INewResubscriber, IWebHookStreamChanged } from 'typings/events'
import { Settings } from '@bot/entities/Settings'
import { error } from '@bot/libs/logger'
import { orm } from '@bot/libs/db'
import { CommandPermission } from '@bot/entities/Command'
import { settings } from '../decorators'
import { command } from '../decorators/command'
import { User } from '../entities/User'
import { HelixSubscription } from 'twitch'

class Twitch implements System {
  private intervals = {
    streamData: null,
    channelData: null,
    subscribers: null,
    latestFollower: null,
  }

  streamMetaData: {
    viewers: number,
    startedAt: Date
  } = {
    viewers: 0,
    startedAt: null,
  }

  channelMetaData: {
    views: number,
    game: string,
    title: string,
    subs?: number,
    followers: number,
    latestSubscriber: {
      username: string,
      tier: string,
      timestamp: number,
    },
    latestFollower: {
      username: string,
      timestamp: number,
    },
    latestReSubscriber: {
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
    followers: 0,
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
    latestFollower: {
      username: 'No data',
      timestamp: undefined,
    },
  }

  @settings()
  latestSubscriber: string = null

  @settings()
  latestReSubscriber: string = null

  async init() {
    const [latestSubscriber, latestReSubscriber] = await Promise.all([
      orm.em.fork().getRepository(Settings).findOne({ space: 'twitch', name: 'latestSubscriber' }),
      orm.em.fork().getRepository(Settings).findOne({ space: 'twitch', name: 'latestReSubscriber' }),
    ])

    if (latestSubscriber) this.channelMetaData.latestSubscriber = latestSubscriber.value as any
    if (latestReSubscriber) this.channelMetaData.latestReSubscriber = latestReSubscriber.value as any

    this.getStreamData()
    this.getChannelData()
    this.getChannelSubscribers()
    this.getChannelLatestFollower()
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
      startedAt: data?.startDate ?? null,
    }
  }

  async onStreamChange(opts: IWebHookStreamChanged) {
    if (opts.game_id) {
      const game = await tmi.clients?.bot?.helix.games.getGameById(opts.game_id)
      this.channelMetaData.game = game.name
    }
    this.channelMetaData.title = opts.title
    this.streamMetaData.viewers = opts.viewer_count
  }

  private async getChannelData() {
    clearTimeout(this.intervals.channelData)
    this.intervals.channelData = setTimeout(() => this.getChannelData(), 1 * 60 * 1000)
    if (!tmi.channel?.id) return

    const channel = await tmi?.clients?.bot?.kraken.users.getUser(tmi.channel?.id)
    if (!channel) return

    const data = await (await tmi?.clients?.bot?.kraken.users.getUser(tmi.channel?.id))?.getChannel()

    this.channelMetaData.views = data?.views ?? 0,
    this.channelMetaData.game = data?.game ?? 'No data',
    this.channelMetaData.title = data?.status ?? 'No data'
    this.channelMetaData.followers = data?.followers ?? 0
  }

  private async getChannelSubscribers() {
    clearTimeout(this.intervals.subscribers)
    this.intervals.subscribers = setTimeout(() => this.getChannelSubscribers(), 1 * 60 * 1000)
    try {
      if (!tmi.clients.broadcaster || !tmi.channel?.id) return
      const data = await (tmi.clients.broadcaster.helix.subscriptions.getSubscriptionsPaginated(tmi.channel?.id)).getAll()
      this.updateDbSubscribers(data)
      this.channelMetaData.subs = data.length - 1 || 0
    } catch (e) {
      if (e.message.includes('This token does not have the requested scopes')) return
      error(e.message)
    }
  }

  private async updateDbSubscribers(data: HelixSubscription[]) {
    const repository = orm.em.fork().getRepository(User)
    const idsArray = data.map(u => Number(u.userId))

    const notSubscribers = await repository.find({
      id: { $in: idsArray },
      isSubscriber: false,
    })
    notSubscribers.forEach(user => user.isSubscriber = true)

    const subscribers = await repository.find({
      id: { $nin: idsArray },
      isSubscriber: true,
    })
    subscribers.forEach(user => user.isSubscriber = false)

    const existedUsersById = [
      ...notSubscribers.map(user => user.id),
      ...subscribers.map(user => user.id),
    ]
    const notExistedUsers = data
      .filter(u => !existedUsersById.includes(Number(u.userId)))
      .reduce((array, current) => {
        const user = repository.assign(new User(), {
          id: String(current.userId),
          isSubscriber: true,
          username: current.userDisplayName,
        })
        return [...array, user]
      }, [] as User[])

    await repository.persistAndFlush([
      ...subscribers,
      ...notSubscribers,
      ...notExistedUsers,
    ])
  }

  private async getChannelLatestFollower() {
    clearTimeout(this.intervals.latestFollower)
    this.intervals.latestFollower = setTimeout(() => this.getChannelLatestFollower(), 1 * 60 * 1000)

    try {
      const { data } = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel.id }) || {}
      if (!data) return
      const follower = data[0]

      this.channelMetaData.latestFollower = {
        username: follower.userDisplayName,
        timestamp: new Date(follower.followDate).getTime(),
      }
    } catch (e) {
      error(e)
    }
  }

  async getFollowAge(userId: string) {
    const follow = await tmi.clients.bot?.helix.users.getFollows({ followedUser: tmi.channel?.id, user: userId })
    if (!follow.total) return 'not follower'

    return humanizeDuration(Date.now() - new Date(follow.data[0].followDate).getTime(), {
      units: ['y', 'mo', 'd', 'h', 'm'],
      round: true,
      language: locales.translate('lang.code'),
    })
  }

  get uptime() {
    if (!this.streamMetaData?.startedAt) return 'offline'

    return humanizeDuration(Date.now() - new Date(this.streamMetaData?.startedAt).getTime(), {
      units: ['mo', 'd', 'h', 'm', 's'],
      round: true,
      language: locales.translate('lang.code'),
    })
  }

  @command({
    name: 'title',
    permission: CommandPermission.MODERATORS,
    visible: false,
    description: 'commands.title.description',
  })
  async setTitle(opts: CommandOptions) {
    if (!opts.argument.trim().length) return `$sender ${this.channelMetaData.title}`

    await tmi.clients?.bot?.kraken.channels.updateChannel(tmi.channel?.id, {
      status: opts.argument,
    })

    return '$sender ✅'
  }

  @command({
    name: 'category',
    aliases: ['game'],
    permission: CommandPermission.MODERATORS,
    visible: false,
    description: 'commands.category.description',
  })
  async setGame(opts: CommandOptions) {
    if (!opts.argument.trim().length) return `$sender ${this.channelMetaData.game}`

    const suggestedGame = await tmi.clients?.bot?.helix.games.getGameByName(opts.argument)

    if (!suggestedGame) return

    await tmi.clients?.bot?.kraken.channels.updateChannel(tmi.channel?.id, {
      game: suggestedGame.name,
    })

    return '$sender ✅'
  }

  async onSubscribe(data: INewSubscriber) {
    const value = { username: data.username, tier: data.tier, timestamp: Date.now() }
    this.channelMetaData.latestSubscriber = value

    let instance = await orm.em.fork().getRepository(Settings).findOne({ space: 'twitch', name: 'latestSubscriber' })
    if (!instance) {
      instance = orm.em.fork().getRepository(Settings).create({ space: 'twitch', name: 'latestSubscriber' })
    }
    instance.value = value as any
    await orm.em.fork().persistAndFlush(instance)
  }

  async onReSubscribe(data: INewResubscriber) {
    const value = { username: data.username, tier: data.tier, timestamp: Date.now(), months: data.months, overallMonths: data.overallMonths }
    this.channelMetaData.latestReSubscriber = value

    let instance = await orm.em.fork().getRepository(Settings).findOne({ space: 'twitch', name: 'latestReSubscriber' })
    if (!instance) {
      instance = orm.em.fork().getRepository(Settings).create({ space: 'twitch', name: 'latestReSubscriber' })
    }
    instance.value = value as any
    await orm.em.fork().persistAndFlush(instance)
  }
}

export default new Twitch()
