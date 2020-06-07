import { literal } from 'sequelize'
import { chunk as makeChunk } from 'lodash'

import { System, ParserOptions, Command, CommandOptions, CommandPermission } from '../../../typings'
import User from '@bot/models/User'
import tmi from '@bot/libs/tmi'
import UserTips from '@bot/models/UserTips'
import UserBits from '@bot/models/UserBits'
import twitch from './twitch'
import Settings from '@bot/models/Settings'

export default new class Users implements System {
  settings: { 
    enabled: boolean,
    ignoredUsers: string[]
  } = { 
    enabled: true,
    ignoredUsers: []
  }

  private countWatchedTimeout: NodeJS.Timeout = null
  private getChattersTimeout: NodeJS.Timeout = null

  private chatters: Array<{ username: string, id: string }> = []

  parsers = [
    { fnc: this.parseMessage }
  ]
  commands: Command[] = [
    { name: 'sayb', permission: 'broadcaster', fnc: this.sayb, visible: false },
    { name: 'ignore add', permission: 'moderators', fnc: this.ignoreAdd, visible: false },
    { name: 'ignore remove', permission: 'moderators', fnc: this.ignoreRemove, visible: false }
  ]

  async init() {
    const [enabled, ignoredUsers]: [Settings, Settings] = await Promise.all([
      Settings.findOne({ where: { space: 'users', name: 'enabled' } }),
      Settings.findOne({ where: { space: 'users', name: 'ignoredUsers' } }),
    ])

    this.settings.ignoredUsers = ignoredUsers?.value?.filter(Boolean) ?? []
    this.settings.enabled = enabled?.value ?? true

    if (!this.settings.enabled) return;

    await this.getChatters()
    await this.countWatched()
  }

  async parseMessage(opts: ParserOptions) {
    if (!this.settings.enabled || opts.message.startsWith('!')) return
    if (this.settings.ignoredUsers.includes(opts.raw.userInfo.userName)) return;

    const [id, username] = [opts.raw.userInfo.userId, opts.raw.userInfo.userName]

    const [user, created]: [User, boolean] = await User.findOrCreate({
      where: { id },
      defaults: { id, username, messages: 1 }
    })

    if (!created) {
      user.update({ username, messages: literal('messages + 1') })
    }
  }

  async getUserStats({ id, username }: { id?: string, username?: string }): Promise<User> {
    if (!id && !username) throw new Error('Id or username should be used.')

    if (!id) {
      const byName = await tmi?.clients?.bot?.helix.users.getUserByName(username)
      id = byName.id
    }

    let user = await User.findOne({ 
      where: { id },
      include: [UserTips, UserBits],
      attributes: { include: ['totalTips', 'totalTips' ]},
    })
    
    if (!user) user = await User.create({
      id,
      username
    }, { include: [UserTips, UserBits] })

    return user
  }

  private async countWatched() {
    clearTimeout(this.countWatchedTimeout)
    this.countWatchedTimeout = setTimeout(() => this.countWatched(), 1 * 60 * 1000)

    if (!twitch.streamMetaData?.startedAt) return;

    for (const chatter of this.chatters) {
      if (this.settings.ignoredUsers.includes(chatter.username.toLowerCase())) continue

      const [user, created]: [User, boolean] = await User.findOrCreate({
        where: { id: chatter.id },
        defaults: { id: chatter.id, username: chatter.username }
      })

      if (!created) user.increment({ watched: 1 * 60 * 1000 })
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

  hasPermission(badges: Map<string, string>, searchForPermission: CommandPermission) {
    const userPerms = Object.entries(tmi.getUserPermissions(badges))
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
