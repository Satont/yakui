import { System, Command as CommandType } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import Command from '../models/Command'
import tmi from '../libs/tmi'

export default new class CustomSystems implements System {
  commands: CommandType[] = []

  async init() {
    const commands: Command[] = await Command.findAll()
    
    this.commands = commands.map(command => ({
      name: command.name,
      cooldown: command.cooldown,
      permission: command.permission,
      response: command.response,
      description: command.description,
      aliases: command.aliases,
      fnc: this.fnc
    }))
   
    Command.afterCreate(() => this.init())
    Command.afterDestroy(() => this.init())
    Command.afterUpdate(() => this.init())
  }

  async fnc(message: string, raw: TwitchPrivateMessage, command: CommandType) {
    return command.response
  }

}
