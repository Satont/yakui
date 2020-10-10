import { chunk as makeChunk } from 'lodash'

import { System, ParserOptions, Command, CommandOptions, UserPermissions } from '@src/typings'
import { User } from '@bot/entities/User'
import tmi from '@bot/libs/tmi'
import { UserDailyMessages } from '@bot/entities/UserDailyMessages'
import twitch from './twitch'
import { Settings } from '@bot/entities/Settings'
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { orm } from '@bot/libs/db'
import { CommandPermission } from '@bot/entities/Command'
import { settings } from '../decorators'

class Users implements System {
  private countWatchedTimeout: NodeJS.Timeout = null
  private getChattersTimeout: NodeJS.Timeout = null

  private chatters: Array<{ username: string, id: string }> = []

  parsers = [
    { fnc: this.parseMessage },
  ]
  commands: Command[] = [
    { name: 'sayb', permission: CommandPermission.BROADCASTER, fnc: this.sayb, visible: false, description: 'Say something as broadcaster.' },
    { name: 'ignore add', permission: CommandPermission.MODERATORS, fnc: this.ignoreAdd, visible: false, description: 'Add some username to bot ignore list' },
    { name: 'ignore remove', permission: CommandPermission.MODERATORS, fnc: this.ignoreRemove, visible: false, description: 'Remove some username from bot ignore list' },
  ]

  @settings()
  enabled = true

  @settings()
  ignoredUsers: string[] = []

  @settings()
  botAdmins: string[] = []

  @settings()
  points = {
    enabled: true,
    messages: {
      interval: 1,
      amount: 1,
    },
    watch:{
      interval: 1,
      amount: 1,
    },
  }


  async init() {
    await this.getChatters()
    await this.countWatched()
  }

  async parseMessage(opts: ParserOptions) {
    if (!this.enabled || opts.message.startsWith('!')) return
    if (this.ignoredUsers?.includes(opts.raw.userInfo.userName)) return
    if (!twitch.streamMetaData.startedAt) return
  
    const [pointsPerMessage, pointsInterval] = [this.points.messages.amount, this.points.messages.interval * 60 * 1000]

    const [id, username] = [opts.raw.userInfo.userId, opts.raw.userInfo.userName]

    const repository = orm.em.getRepository(User)
    const user = await repository.findOne(Number(id)) || repository.assign(new User(), { id: Number(id), username, messages: 0 })

    user.username = opts.raw.userInfo.userName
    user.messages +=  1

    const updatePoints = (Number(user.lastMessagePoints) + pointsInterval <= user.messages) && this.points.enabled

    if (updatePoints && twitch.streamMetaData?.startedAt && pointsPerMessage !== 0 && pointsInterval !== 0) {
      user.points = user.points + pointsPerMessage
      user.lastMessagePoints = new Date().getTime()
    }

    await repository.persistAndFlush(user)

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const dailyRepository = orm.em.getRepository(UserDailyMessages)
    const daily = await dailyRepository.findOne({ user: user.id, date: startOfDay.getTime() }) || dailyRepository.assign(new UserDailyMessages(), { 
      user, 
      date: startOfDay.getTime(),
    }) 

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
    await repository.persistAndFlush(create)
    return create
  }

  private async countWatched() {
    clearTimeout(this.countWatchedTimeout)
    this.countWatchedTimeout = setTimeout(() => this.countWatched(), 1 * 60 * 1000)
    const [pointsPerWatch, pointsInterval] = [this.points.watch.amount, this.points.watch.interval * 60 * 1000]
    
    if (!twitch.streamMetaData?.startedAt || !this.enabled) return

    const repository = orm.em.getRepository(User)
    const usersForUpdate: User[] = []

    for (const chatter of this.chatters) {
      if (this.ignoredUsers?.includes(chatter.username.toLowerCase())) continue

      const user = await repository.findOne(Number(chatter.id)) || repository.assign(new User(), { id: Number(chatter.id), username: chatter.username })

      const updatePoints = (new Date().getTime() - new Date(user.lastWatchedPoints).getTime() >= pointsInterval) && this.points.enabled

      if (pointsPerWatch !== 0 && pointsInterval !== 0 && updatePoints) {
        user.lastWatchedPoints = new Date().getTime()
        user.points += pointsPerWatch
      }

      user.watched += 1 * 60 * 1000
      usersForUpdate.push(user)
    }

    await repository.persistAndFlush(usersForUpdate)
  }

  private async getChatters() {
    clearTimeout(this.getChattersTimeout)
    this.getChattersTimeout = setTimeout(() => this.getChatters(), 5 * 60 * 1000)

    this.chatters = []

    for (const chunk of makeChunk((await tmi.clients?.bot?.unsupported.getChatters(tmi.channel?.name))?.allChatters, 100)) {

      const users = (await tmi.clients?.bot?.helix.users.getUsersByNames(chunk)).map(user => ({ username: user.name, id: user.id }))

      this.chatters.push(...users)
    }
  }

  sayb(opts: CommandOptions) {
    tmi.chatClients?.broadcaster?.say(tmi.channel?.name, opts.argument)
  }

  getUserPermissions(badges: Map<string, string>, raw?: TwitchPrivateMessage): UserPermissions {
    return {
      broadcaster: badges.has('broadcaster') || this.botAdmins?.includes(raw?.userInfo.userName),
      moderators: badges.has('moderator'),
      vips: badges.has('vip'),
      subscribers: badges.has('subscriber') || badges.has('founder'),
      viewers: true,
    }
  }

  hasPermission(badges: Map<string, string>, searchForPermission: CommandPermission, raw?: TwitchPrivateMessage) {
    if (!searchForPermission) return true
    
    const userPerms = Object.entries(this.getUserPermissions(badges, raw))
    const commandPermissionIndex = userPerms.indexOf(userPerms.find(v => Object.keys(searchForPermission).indexOf(v[0])))

    return userPerms.some((p, index) => p[1] && index <= commandPermissionIndex)
  }

  async ignoreAdd(opts: CommandOptions) {
    if (!opts.argument.length) return
    const repository = orm.em.getRepository(Settings)
    const data = { space: 'users', name: 'ignoredUsers' }
    const ignoredUsers = await repository.findOne(data) || repository.create({ ...data, value: [] })

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

    const users: string[] = ignoredUsers.value

    users.splice(ignoredUsers.value.indexOf(opts.argument.toLowerCase()), 1) 

    ignoredUsers.value = users
    await orm.em.persistAndFlush(ignoredUsers)

    return '$sender ✅'
  }

}

export default new Users()
