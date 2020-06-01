import { System, Command as CommandType } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import Command from '../models/Command'
import tmi from '../libs/tmi'

export default new class CustomSystems implements System {
  commands: CommandType[] = []

  async init() {
    const commands: Command[] = await Command.findAll()
    for (const command of commands) {
      this.commands.push({
        name: command.name,
        cooldown: command.cooldown,
        permission: command.permission,
        response: command.response,
        description: command.description,
        aliases: command.aliases,
        fnc: this.fnc
      })
    }

    this.listenCommandUpdates()
  }

  async fnc(message: string, raw: TwitchPrivateMessage, command: CommandType) {
    return command.response
  }

  async listenCommandUpdates() {
    Command.afterCreate(null, () => this.init())
    Command.afterDestroy(null, () => this.init())
    Command.afterUpdate(null, () => this.init())
  }
}
