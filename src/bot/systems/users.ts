import { chunk as makeChunk } from 'lodash'

import { System, ParserOptions, Command, CommandOptions, CommandPermission } from '../../../typings'
import User from '@bot/models/User'
import tmi from '@bot/libs/tmi'
import UserTips from '@bot/models/UserTips'
import UserBits from '@bot/models/UserBits'
import UserDailyMessages from '@bot/models/UserDailyMessages'
import twitch from './twitch'
import Settings from '@bot/models/Settings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'

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
      }
    }
  }

  private countWatchedTimeout: NodeJS.Timeout = null
  private getChattersTimeout: NodeJS.Timeout = null

  private chatters: Array<{ username: string, id: string }> = []

  parsers = [
    { fnc: this.parseMessage }
  ]
  commands: Command[] = [
    { name: 'sayb', permission: 'broadcaster', fnc: this.sayb, visible: false, description: 'Say something as broadcaster.' },
    { name: 'ignore add', permission: 'moderators', fnc: this.ignoreAdd, visible: false, description: 'Add some username to bot ignore list' },
    { name: 'ignore remove', permission: 'moderators', fnc: this.ignoreRemove, visible: false, description: 'Remove some username from bot ignore list' }
  ]

  async init() {
    const [enabled, ignoredUsers, points, admins]: [Settings, Settings, Settings, Settings] = await Promise.all([
      Settings.findOne({ where: { space: 'users', name: 'enabled' } }),
      Settings.findOne({ where: { space: 'users', name: 'ignoredUsers' } }),
      Settings.findOne({ where: { space: 'users', name: 'points' } }),
      Settings.findOne({ where: { space: 'users', name: 'botAdmins' } }),
    ])

    this.settings.ignoredUsers = ignoredUsers?.value?.filter(Boolean) ?? []
    this.settings.enabled = enabled?.value ?? true
    this.settings.admins = admins?.value ?? []

    if (points) this.settings.points = points.value
    if (!this.settings.enabled) return;

    await this.getChatters()
    await this.countWatched()
  }

  async parseMessage(opts: ParserOptions) {
    if (!this.settings.enabled || opts.message.startsWith('!')) return
    if (this.settings.ignoredUsers.includes(opts.raw.userInfo.userName)) return;
    const [pointsPerMessage, pointsInterval] = [this.settings.points.messages.amount, this.settings.points.messages.interval * 60 * 1000]

    const [id, username] = [opts.raw.userInfo.userId, opts.raw.userInfo.userName]

    const [user, created]: [User, boolean] = await User.findOrCreate({
      where: { id },
      defaults: { id, username, messages: 1 },
    })

    if (!created) {
      user.messages = user.messages + 1
      user.username = opts.raw.userInfo.userName
    }

    const updatePoints = (Number(user.lastMessagePoints) + pointsInterval <= user.messages) && this.settings.points.enabled

    if (updatePoints && twitch.streamMetaData?.startedAt && pointsPerMessage !== 0 && pointsInterval !== 0) {
      user.points = user.points + pointsPerMessage
      user.lastMessagePoints = new Date().getTime()
    }

    user.save()

    if (!twitch.streamMetaData?.startedAt) return;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [daily, isNewDailyRow]: [UserDailyMessages, boolean] = await UserDailyMessages.findOrCreate({
      where: { userId: user.id, date: startOfDay.getTime() },
      defaults: { count: 1 }
    })

    if (!isNewDailyRow) daily.increment({ count: 1 })
  }

  async getUserStats({ id, username }: { id?: string, username?: string }): Promise<User> {
    if (!id && !username) throw new Error('Id or username should be used.')

    if (!id) {
      const byName = await tmi?.clients?.bot?.helix.users.getUserByName(username)
      id = byName.id
    }

    let user = await User.findOne({
      where: { id },
      include: [UserTips, UserBits, UserDailyMessages],
      attributes: { include: ['totalTips', 'totalTips', 'todayMessages' ]},
    })

    if (!user) user = await User.create({
      id,
      username
    }, { include: [UserTips, UserBits, UserDailyMessages] })

    return user
  }

  private async countWatched() {
    clearTimeout(this.countWatchedTimeout)
    this.countWatchedTimeout = setTimeout(() => this.countWatched(), 1 * 60 * 1000)
    const [pointsPerWatch, pointsInterval] = [this.settings.points.watch.amount, this.settings.points.watch.interval * 60 * 1000]

    if (!twitch.streamMetaData?.startedAt) return;

    for (const chatter of this.chatters) {
      if (this.settings.ignoredUsers.includes(chatter.username.toLowerCase())) continue

      const [user, created]: [User, boolean] = await User.findOrCreate({
        where: { id: chatter.id },
        defaults: { id: chatter.id, username: chatter.username }
      })

      if (!created) user.watched = user.watched + 1 * 60 * 1000

      const updatePoints = (new Date().getTime() - new Date(user.lastWatchedPoints).getTime() >= pointsInterval) && this.settings.points.enabled

      if (pointsPerWatch !== 0 && pointsInterval !== 0 && updatePoints) {
        user.lastWatchedPoints = new Date().getTime()
        user.points = user.points + pointsPerWatch
      }

      user.save()
    }

  }

  private async getChatters() {
    clearTimeout(this.getChattersTimeout)
    this.getChattersTimeout = setTimeout(() => this.getChatters(), 5 * 60 * 1000)

    this.chatters = []
    if (!twitch.streamMetaData?.startedAt) return;

    for (const chunk of makeChunk((await tmi.clients?.bot?.unsupported.getChatters(tmi.channel?.name)).allChatters, 100)) {

      const users = (await tmi.clients?.bot?.helix.users.getUsersByNames(chunk)).map(user => ({ username: user.name, id: user.id }))

      this.chatters.push(...users)
    }
  }

  sayb(opts: CommandOptions) {
    tmi.chatClients?.broadcaster?.say(tmi.channel?.name, opts.argument)
  }

  hasPermission(badges: Map<string, string>, searchForPermission: CommandPermission, raw?: TwitchPrivateMessage) {
    const userPerms = Object.entries(tmi.getUserPermissions(badges, raw))
    const commandPermissionIndex = userPerms.indexOf(userPerms.find(v => v[0] === searchForPermission))

    return userPerms.some((p, index) => p[1] && index <= commandPermissionIndex)
  }

  async ignoreAdd(opts: CommandOptions) {
    if (!opts.argument.length) return;
    const [ignoredUsers]: [Settings] = await Settings.findOrCreate({ where: { space: 'users', name: 'ignoredUsers' }, defaults: { value: [] } })

    await ignoredUsers.update({ value: [...ignoredUsers.value, opts.argument.toLowerCase() ].filter(Boolean) })

    return '$sender ✅'
  }

  async ignoreRemove(opts: CommandOptions) {
    if (!opts.argument.length) return;
    const ignoredUsers: Settings = await Settings.findOne({ where: { space: 'users', name: 'ignoredUsers' } })

    if (!ignoredUsers || !ignoredUsers?.value.length) return
    if (!ignoredUsers.value.includes(opts.argument.toLowerCase())) return

    const users = ignoredUsers.value
    users.splice(ignoredUsers.value.indexOf(opts.argument.toLowerCase()), 1)

    await ignoredUsers.update({
      value: users
    })

    return '$sender ✅'
  }


  listenDbUpdates() {
    Settings.afterSave(instance => {
      if (instance.space !== 'users') return

      this.init()
    })
  }
}
