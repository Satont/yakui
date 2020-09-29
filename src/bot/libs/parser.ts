import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'

import { Command, System } from 'typings'
import tmi from './tmi'
import Variables from '@bot/systems/variables'

import users from '@bot/systems/users'
import variables from '@bot/systems/variables'
import User from '@bot/models/User'
import locales from './locales'
import File from '@bot/models/File'
import cache from './cache'
import CommandModel from '@bot/models/Command'

export default new class Parser {
  systems: { [x: string]: System } = {}
  inited = false;
  cooldowns: string[] = []

  async parse(message: string, raw: TwitchPrivateMessage) {
    const isCommand = message.startsWith('!')

    if (isCommand) {
      await this.parseCommand(message, raw)
    }

    for (const parser of [...cache.parsers.values()]) {
      await parser.fnc.call(parser.system, { message, raw })
    }
  }

  private async parseCommand(message: string, raw: TwitchPrivateMessage) {
    message = message.substring(1).trim()
    let command: Command
    let findedBy: string
    const msgArray = message.toLowerCase().split(' ')

    for (let i = 0, len = msgArray.length; i < len; i++) {
      const query = msgArray.join(' ')
      const find = cache.commands.get(query) || cache.commandsAliases.get(query)
      if (!find) msgArray.pop()
      else {
        findedBy = query
        command = find
      }
    }

    if (!users.hasPermission(raw.userInfo.badges, command.permission, raw)) return

    if (command.price && !this.cooldowns.includes(command.name)) {
      const [user]: [User] = await User.findOrCreate({
        where: { id: raw.userInfo.userId },
        defaults: { id: raw.userInfo.userId, username: raw.userInfo.userName },
      })

      if (user.points < command.price) {
        tmi.say({ message: locales.translate('price.notEnought', raw.userInfo.userName) })
        return
      } else user.decrement({ points: command.price })
    }

    if (command.type === 'custom') {
      CommandModel.increment({ usage: 1 }, { where: { id: command.id }})
    }
    
    if (command.sound && (command.sound.soundId as any) !== '0' && !this.cooldowns.includes(command.name)) {
      const alerts = await import('@bot/overlays/alerts')
      alerts.default.emitAlert({ 
        audio: { 
          file: await File.findOne({ where: { id: command.sound.soundId } }) ,
          volume: command.sound.volume,
        },
      })
    }
    
    const argument = message.replace(new RegExp(`^${findedBy}`), '').trim()
    
    let commandResult: string = await command.fnc.call(command.system, { message, raw, command, argument })
    
    if (!commandResult) return
    
    // set custom variable
    if (await variables.changeCustomVariable({ raw, response: commandResult, text: argument })) {
      return
    }
    //
    
    commandResult = await Variables.parseMessage({ message: commandResult, raw, argument, command })
    
    if (!commandResult.length) return
    const userPerms = tmi.getUserPermissions(raw.userInfo.badges, raw)
    this.cooldowns.includes(command.name) && (!userPerms.broadcaster && !userPerms.moderators)
      ? tmi.whispers({ target: raw.userInfo.userName, message: commandResult })
      : tmi.say({ message: commandResult })
    
    if (command.cooldown !== 0 && !this.cooldowns.includes(command.name)) {
      this.cooldowns.push(command.name)
      setTimeout(() => this.cooldowns.splice(this.cooldowns.indexOf(command.name)), command.cooldown * 1000)
    }
  }
}
