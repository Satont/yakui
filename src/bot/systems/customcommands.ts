import { System, Command as CommandType, CommandOptions } from 'typings'
import { Command } from '@bot/entities/Command'
import CommandSound from '@bot/models/CommandSound'

export default new class CustomCommands implements System {
  commands: CommandType[] = []

  async init() {
    const commands: Command[] = await Command.findAll({
      include: [CommandSound],
    })

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
      sound: command.sound || { soundId: '0', volume: 50 } as any,
      type: 'custom',
      usage: command.usage,
    }))
  }

  async fnc(opts: CommandOptions) {
    return opts.command.response
  }
}
