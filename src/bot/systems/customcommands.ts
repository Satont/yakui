import { System, Command as CommandType, CommandOptions } from '../../../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import Command from '../models/Command'

export default new class CustomCommands implements System {
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
  }

  async fnc(opts: CommandOptions) {
    return opts.command.response
  }

  listenDbUpdates() {
    Command.afterDestroy(() => this.init())
    Command.afterSave(() => this.init())
  }

}
