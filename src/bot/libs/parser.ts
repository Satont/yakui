import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'

import { Command, System } from 'typings'
import tmi from './tmi'
import Variables from '@bot/systems/variables'

import users from '@bot/systems/users'
import variables from '@bot/systems/variables'
import { User } from '@bot/entities/User'
import locales from './locales'
import cache from './cache'
import { Command as CommandModel } from '@bot/entities/Command'
import { orm } from './db'
import { File } from '@bot/entities/File'

class Parser {
  systems: { [x: string]: System } = {}
  inited = false;
  cooldowns: string[] = []

  async parse(message: string, raw: TwitchPrivateMessage) {
    const isCommand = message.startsWith('!')

    if (isCommand) {
      await this.parseCommand(message, raw)
    }

    for (const parser of cache.parsers.values()) {
      await parser.system[parser.fnc].call(parser.system, { message, raw })
    }
  }

  private async parseCommand(message: string, raw: TwitchPrivateMessage) {
    if (users.isIgnored(raw.userInfo.userName) || users.isIgnored(raw.userInfo.userId)) return

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

    if (!command) return
    if (!users.hasPermission(raw.userInfo.badges, command.permission, raw)) return

    if (command.price && !this.cooldowns.includes(command.name)) {
      let user = await orm.em.fork().getRepository(User).findOne({ id: Number(raw.userInfo.userId) })
      if (!user) {
        user = orm.em.fork().getRepository(User).create({ id: Number(raw.userInfo.userId), username: raw.userInfo.userName })
      }
      if (user.points < command.price) {
        tmi.say({ message: locales.translate('price.notEnought', raw.userInfo.userName) })
        return
      } else user.points -= command.price
      await orm.em.fork().persistAndFlush(user)
    }

    if (command.type === 'custom') {
      this.increaseCommandUsage({ id: command.id })
    }

    if (command.sound_file && !this.cooldowns.includes(command.name)) {
      this.emitAlert(command)
    }

    const argument = message.replace(new RegExp(`^${findedBy}`), '').trim()

    let commandResult: string = await command.system[command.fnc].call(command.system, { message, raw, command, argument })

    if (!commandResult) return

    // set custom variable
    if (commandResult.match(/\$_(\S*)/g)) {
      const isVariableChanged = await variables.changeCustomVariable({ raw, response: commandResult, text: argument })
      if (isVariableChanged) {
        return
      }
    }
    //

    commandResult = await Variables.parseMessage({ message: commandResult, raw, argument, command })

    if (!commandResult.length) return
    const userPerms = users.getUserPermissions(raw.userInfo.badges, raw)
    this.cooldowns.includes(command.name) && (!userPerms.broadcaster && !userPerms.moderators)
      ? tmi.whispers({ target: raw.userInfo.userName, message: commandResult })
      : tmi.say({ message: commandResult })

    if (command.cooldown !== 0 && !this.cooldowns.includes(command.name)) {
      this.cooldowns.push(command.name)
      setTimeout(() => this.cooldowns.splice(this.cooldowns.indexOf(command.name)), command.cooldown * 1000)
    }
  }

  private async increaseCommandUsage({ id }: { id: Command['id'] }) {
    const cmd = await orm.em.fork().getRepository(CommandModel).findOne({ id })
    cmd.usage += 1
    orm.em.fork().persistAndFlush(cmd)
  }

  private async emitAlert(command: Command) {
    const { default: alerts } = await import('@bot/overlays/alerts')
    alerts.emitAlert({
      audio: {
        file: command.sound_file as File,
        volume: command.sound_volume,
      },
    })
  }
}

export default new Parser()
