import { System, Command as CommandType, CommandOptions } from 'typings';
import { prisma } from '@bot/libs/db';

class CustomCommands implements System {
  commands: CommandType[] = [];

  async init() {
    const commands = await prisma.commands.findMany({
      include: {
        sound_file: true,
      },
    });

    this.commands = commands.map((command) => ({
      ...command,
      type: 'custom',
      fnc: 'fnc',
      aliases: command.aliases as string[],
    }));
  }

  async fnc(opts: CommandOptions) {
    return opts.command.response;
  }
}

export default new CustomCommands();
