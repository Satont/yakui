import { System, Command as CommandType, CommandOptions } from 'typings'
import Command from '@bot/models/Command'

export default new class CustomCommands implements System {
  commands: CommandType[] = []

  async init() {
    const commands: Command[] = await Command.findAll()
    this.commands = commands.map(command => ({
      id: command.id,
      name: command.name,
      cooldown: command.cooldown,
      permission: command.permission,
      response: command.response,
      description: command.description,
      aliases: command.aliases,
      price: command.price,
      visible: command.visible,
      enabled: command.enabled,
      fnc: this.fnc,
      type: 'custom'
    }))
  }

  async fnc(opts: CommandOptions) {
    return opts.command.response
  }
}
