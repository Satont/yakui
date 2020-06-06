import TwitchPrivateMessage from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage"

import { System, Command } from "../../../typings"
import tmi from "./tmi"
import Variables from "../systems/variables"

import { loadedSystems } from './loader'
import users from "../systems/users"

export default new class Parser {
  systems: { [x: string]: System } = {}
  inited = false;
  cooldowns: string[] = []


  async parse(message: string, raw: TwitchPrivateMessage) {
    const isCommand = message.startsWith('!')

    if (isCommand) {
      await this.parseCommand(message, raw)
    }

    for (const system of loadedSystems) {
      if (typeof system.parsers === 'undefined') continue
      for (let parser of system.parsers) {
        await parser.fnc.call(system, { message, raw })
      }
    }
  }

  private async parseCommand(message: string, raw: TwitchPrivateMessage) {
    message = message.substring(1).trim()

    for (const system of loadedSystems) {
      if (typeof system.commands === 'undefined') continue

      let msgArray = message.toLowerCase().split(' ')

      let findedBy: string
      let command: Command | null = null

      for (let i = 0, len = message.split(' ').length; i < len; i++) {
        const query = msgArray.join(' ')
        const find = system.commands.find(o => o.name === query || o.aliases?.includes(query))
        if (!find) msgArray.pop()
        else {
          findedBy = query
          command = find
        }
      }

      if (!command) continue

      if (!users.hasPermission(raw.userInfo.badges, command.permission)) break;

      const argument = message.replace(new RegExp(`^${findedBy}`), '').trim()

      let commandResult: string = await command.fnc.call(system, { message, raw, command, argument })

      if (!commandResult) break

      commandResult = await Variables.parseMessage({ message: commandResult, raw })

      this.cooldowns.includes(command.name) 
          ? tmi.whispers({ target: raw.userInfo.userName, message: commandResult }) 
          : tmi.say({ message: commandResult })

      if (command.cooldown && command.cooldown !== 0 && !this.cooldowns.includes(command.name) ) {
        this.cooldowns.push(command.name)
        setTimeout(() => this.cooldowns.splice(this.cooldowns.indexOf(command.name)), command.cooldown * 1000)
      }

      break;
    }
  }
}