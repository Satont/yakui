import { System, Command as CommandType, CommandOptions } from '@src/typings'
import { Command } from '@bot/entities/Command'
import { orm } from '@bot/libs/db'

export default new class CustomCommands implements System {
  commands: CommandType[] = []

  async init() {
    const commands = await orm.em.getRepository(Command).findAll(['sound_file'])

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
      sound_file: command.sound_file,
      type: 'custom',
      usage: command.usage,
    }))

  }

  async fnc(opts: CommandOptions) {
    return opts.command.response
  }
}
