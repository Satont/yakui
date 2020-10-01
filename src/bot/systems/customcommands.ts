import { System, Command as CommandType, CommandOptions } from '@src/typings'
import { Command } from '@bot/entities/Command'
import { orm } from '@bot/libs/db'

export default new class CustomCommands implements System {
  commands: CommandType[] = []

  async init() {
    const commands = await orm.em.getRepository(Command).findAll({ populate: ['sound.file'] })
    console.log(commands)
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
      sound: command['sound.file'],
      type: 'custom',
      usage: command.usage,
    }))

  }

  async fnc(opts: CommandOptions) {
    return opts.command.response
  }
}
