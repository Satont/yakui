import { literal } from 'sequelize'
import { chunk as makeChunk } from 'lodash'

import { System, ParserOptions, Command, CommandOptions, CommandPermission } from '../../../typings'
import User from '../models/User'
import tmi from '../libs/tmi'
import UserTips from '../models/UserTips'
import UserBits from '../models/UserBits'
import twitch from './twitch'
import Settings from '../models/Settings'

export default new class Users implements System {
  private settings: { 
    enabled: boolean
  } = { 
    enabled: true
  }

  private countWatchedTimeout: NodeJS.Timeout = null
  private getChattersTimeout: NodeJS.Timeout = null

  private chatters: Array<{ username: string, id: string }> = []

  parsers = [
    { fnc: this.parseMessage }
  ]
  commands: Command[] = [
    { name: 'sayb', permission: 'broadcaster', fnc: this.sayb, visible: false }
  ]

  async init() {
    const enabled: Settings = await Settings.findOne({ where: { space: 'users', name: 'enabled' } })
    this.settings.enabled = enabled?.value ?? true
    if (!this.settings.enabled) return;

    await this.getChatters()
    await this.countWatched()
  }

  async parseMessage(opts: ParserOptions) {
    if (!this.settings.enabled || opts.message.startsWith('!')) return

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
      const [user, created]: [User, boolean] = await User.findOrCreate({
        where: { id: chatter.id },
        defaults: { id: chatter.id, username: chatter.username }
      })

      if (!created) user.increment({ watched: 1 * 60 * 1000 })
    }

  }

  private async getChatters() {
    clearTimeout(this.getChattersTimeout)
    this.getChattersTimeout = setTimeout(() => this.countWatched(), 5 * 60 * 1000)

    this.chatters = []
    if (!twitch.streamMetaData?.startedAt) return;

    for (const chunk of makeChunk((await tmi.clients?.bot?.unsupported.getChatters(tmi.channel?.name)).allChatters, 100)) {

      const users = (await tmi.clients?.bot?.helix.users.getUsersByNames(chunk)).map(user => ({ username: user.name, id: user.id }))

      this.chatters.push(...users)
    }
  }

  private sayb(opts: CommandOptions) {
    tmi.chatClients?.broadcaster?.say(tmi.channel?.name, opts.argument)
  }

  hasPermission(badges: Map<string, string>, searchForPermission: CommandPermission) {
    const userPerms = Object.entries(tmi.getUserPermissions(badges))
    const commandPermissionIndex = userPerms.indexOf(userPerms.find(v => v[0] === searchForPermission))

    return userPerms.some((p, index) => p[1] && index <= commandPermissionIndex)
  }

  listenDbUpdates() {
    Settings.afterSave(instance => {
      if (instance.space !== 'users') return

      this.init()
    })
  }
}
