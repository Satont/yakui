import { chunk as makeChunk } from 'lodash'

import { System, ParserOptions, Command, CommandOptions, CommandPermission } from '@src/typings'
import { User } from '@bot/entities/User'
import tmi from '@bot/libs/tmi'
import { UserDailyMessages } from '@bot/entities/UserDailyMessages'
import twitch from './twitch'
import { Settings } from '@bot/entities/Settings'
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { orm } from '@bot/libs/db'

export default new class Users implements System {
  settings: {
    enabled: boolean,
    ignoredUsers: string[],
    admins: string[],
    points: {
      enabled: boolean,
      messages: {
        interval: number,
        amount: number,
      },
      watch: {
        interval: number,
        amount: number,
      }
    }
  } = {
    enabled: true,
    ignoredUsers: [],
    admins: [],
    points: {
      enabled: false,
      messages: {
        interval: 1,
        amount: 1,
      },
      watch: {
        interval: 1,
        amount: 1,
      },
    },
  }

  private countWatchedTimeout: NodeJS.Timeout = null
  private getChattersTimeout: NodeJS.Timeout = null

  private chatters: Array<{ username: string, id: string }> = []

  parsers = [
    { fnc: this.parseMessage },
  ]
  commands: Command[] = [
    { name: 'sayb', permission: CommandPermission['broadcaster'], fnc: this.sayb, visible: false, description: 'Say something as broadcaster.' },
    { name: 'ignore add', permission: CommandPermission['moderators'], fnc: this.ignoreAdd, visible: false, description: 'Add some username to bot ignore list' },
    { name: 'ignore remove', permission: CommandPermission['moderators'], fnc: this.ignoreRemove, visible: false, description: 'Remove some username from bot ignore list' },
  ]

  async init() {
    const repository = orm.em.getRepository(Settings)
    const [enabled, ignoredUsers, points, admins] = await Promise.all([
      repository.findOne({ space: 'users', name: 'enabled' }),
      repository.findOne({ space: 'users', name: 'ignoredUsers' }),
      repository.findOne({ space: 'users', name: 'points' }),
      repository.findOne({ space: 'users', name: 'botAdmins' }),
    ])

    this.settings.ignoredUsers = ignoredUsers?.value as any ?? []
    this.settings.enabled = enabled?.value as any ?? true
    this.settings.admins = admins?.value as any ?? []

    if (points) this.settings.points = points.value as any
    if (!this.settings.enabled) return

    await this.getChatters()
    await this.countWatched()
  }

  async parseMessage(opts: ParserOptions) {
    if (!this.settings.enabled || opts.message.startsWith('!')) return
    if (this.settings.ignoredUsers.includes(opts.raw.userInfo.userName)) return
    const [pointsPerMessage, pointsInterval] = [this.settings.points.messages.amount, this.settings.points.messages.interval * 60 * 1000]

    const [id, username] = [opts.raw.userInfo.userId, opts.raw.userInfo.userName]

    const repository = orm.em.getRepository(User)
    const user = await repository.findOne(Number(id)) || repository.create({ id: Number(id), username })

    user.username = opts.raw.userInfo.userName
    user.messages +=  1

    const updatePoints = (Number(user.lastMessagePoints) + pointsInterval <= user.messages) && this.settings.points.enabled

    if (updatePoints && twitch.streamMetaData?.startedAt && pointsPerMessage !== 0 && pointsInterval !== 0) {
      user.points = user.points + pointsPerMessage
      user.lastMessagePoints = new Date().getTime()
    }

    await repository.persistAndFlush(user)

    if (!twitch.streamMetaData?.startedAt) return

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const dailyRepository = orm.em.getRepository(UserDailyMessages)
    const daily = await dailyRepository.findOne({ userId: user.id, date: startOfDay.getTime() }) || dailyRepository.create({ userId: user.id, date: startOfDay.getTime() })

    daily.count += 1
    await dailyRepository.persistAndFlush(daily)
  }

  async getUserStats({ id, username }: { id?: string, username?: string }): Promise<User> {
    if (!id && !username) throw new Error('Id or username should be used.')

    if (!id) {
      const byName = await tmi?.clients?.bot?.helix.users.getUserByName(username)
      id = byName.id
      username = byName.name
    }

    const repository = orm.em.getRepository(User)
    const user = await repository.findOne(Number(id), ['tips', 'bits', 'daily'])

    if (user) return user

    const create = repository.create({ id: Number(id), username })
    repository.persistAndFlush(create)
    return create
  }

  private async countWatched() {
    const repository = orm.em.getRepository(User)

    clearTimeout(this.countWatchedTimeout)
    this.countWatchedTimeout = setTimeout(() => this.countWatched(), 1 * 60 * 1000)
    const [pointsPerWatch, pointsInterval] = [this.settings.points.watch.amount, this.settings.points.watch.interval * 60 * 1000]

    if (!twitch.streamMetaData?.startedAt) return

    for (const chatter of this.chatters) {
      if (this.settings.ignoredUsers.includes(chatter.username.toLowerCase())) continue

      const user = await repository.findOne(Number(chatter.id)) || repository.create({ id: Number(chatter.id), username: chatter.username })

      const updatePoints = (new Date().getTime() - new Date(user.lastWatchedPoints).getTime() >= pointsInterval) && this.settings.points.enabled

      if (pointsPerWatch !== 0 && pointsInterval !== 0 && updatePoints) {
        user.lastWatchedPoints = new Date().getTime()
        user.points +=  pointsPerWatch
      }

      user.watched += 1 * 60 * 1000

      repository.persistAndFlush(user)
    }

  }

  private async getChatters() {
    clearTimeout(this.getChattersTimeout)
    this.getChattersTimeout = setTimeout(() => this.getChatters(), 5 * 60 * 1000)

    this.chatters = []
    if (!twitch.streamMetaData?.startedAt) return

    for (const chunk of makeChunk((await tmi.clients?.bot?.unsupported.getChatters(tmi.channel?.name)).allChatters, 100)) {

      const users = (await tmi.clients?.bot?.helix.users.getUsersByNames(chunk)).map(user => ({ username: user.name, id: user.id }))

      this.chatters.push(...users)
    }
  }

  sayb(opts: CommandOptions) {
    tmi.chatClients?.broadcaster?.say(tmi.channel?.name, opts.argument)
  }

  hasPermission(badges: Map<string, string>, searchForPermission: CommandPermission, raw?: TwitchPrivateMessage) {
    if (!searchForPermission) return true
    
    const userPerms = Object.entries(tmi.getUserPermissions(badges, raw))
    const commandPermissionIndex = userPerms.indexOf(userPerms.find(v => Object.keys(searchForPermission).indexOf(v[0])))

    return userPerms.some((p, index) => p[1] && index <= commandPermissionIndex)
  }

  async ignoreAdd(opts: CommandOptions) {
    if (!opts.argument.length) return
    const repository = orm.em.getRepository(Settings)
    let ignoredUsers = await repository.findOne({ space: 'users', name: 'ignoredUsers' })
    if (!ignoredUsers) {
      ignoredUsers = repository.create({ space: 'users', name: 'ignoredUsers', value: [] as any })
    }
    
    ignoredUsers.value = [...ignoredUsers.value, opts.argument.toLowerCase()] as any
    await orm.em.persistAndFlush(ignoredUsers)

    return '$sender ✅'
  }

  async ignoreRemove(opts: CommandOptions) {
    if (!opts.argument.length) return
    const repository = orm.em.getRepository(Settings)
    const ignoredUsers = await repository.findOne({ space: 'users', name: 'ignoredUsers' })

    if (!ignoredUsers || !ignoredUsers?.value.length) return
    if (!ignoredUsers.value.includes(opts.argument.toLowerCase())) return

    const users = ignoredUsers.value;

    (users as any).splice(ignoredUsers.value.indexOf(opts.argument.toLowerCase()), 1) 

    ignoredUsers.value = users
    await orm.em.persistAndFlush(ignoredUsers)

    return '$sender ✅'
  }
}
