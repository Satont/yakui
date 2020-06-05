import TwitchPrivateMessage from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage"
import { resolve } from 'path'

import { System, Command } from "../../../typings"
import getFiles from '../commons/getFiles'
import tmi from "./tmi"
import Variables from "../systems/variables"

export default new class Parser {
  systems: { [x: string]: System } = {}
  inited = false;
  cooldowns: string[] = []

  constructor() {
    this.loadSystems()
  }

  async parse(message: string, raw: TwitchPrivateMessage) {
    const isCommand = message.startsWith('!')

    if (isCommand) {
      await this.parseCommand(message, raw)
    }

    for (let system of Object.values(this.systems)) {
      if (typeof system.parsers === 'undefined') continue
      for (let parser of system.parsers) {
        await parser.fnc.call(system, { message, raw })
      }
    }
  }

  private async loadSystems() {
    for await (const file of getFiles(resolve(__dirname, '..', 'systems'))) {
      const loadedFile = await import(resolve(__dirname, '..', 'systems', file))
      this.systems[loadedFile.default.constructor.name.toLowerCase()] = loadedFile.default
    }
    this.inited = true
  }

  private async parseCommand(message: string, raw: TwitchPrivateMessage) {
    for (let system of Object.values(this.systems)) {
      if (typeof system.commands === 'undefined') continue

      message = message.replace('!', '').trim()
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


      let hasPerm = false

      const userPermissions = Object.entries(tmi.getUserPermissions(raw.userInfo.badges))
      const commandPermissionIndex = userPermissions.indexOf(userPermissions.find(v => v[0] === command.permission))

      if (userPermissions.some((p, index) => p[1] && index <= commandPermissionIndex)) hasPerm = true

      if (!hasPerm) break;

      const argument = message.replace(new RegExp(`^${findedBy}`), '').trimLeft()
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
    }
  }
}