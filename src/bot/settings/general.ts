import { CommandOptions } from 'typings';
import { onChange, settings } from '../decorators';
import { command } from '../decorators/command';
import locales from '../libs/locales';
import eventsub from '../libs/eventsub';
import cache from '../libs/cache';
import { CommandPermission } from '@prisma/client';

class General {
  @settings()
    siteUrl = 'http://localhost:3000';

  @settings()
    locale = 'ru';

  @onChange('siteUrl')
  onSiteUrlChange() {
    eventsub.init();
  }

  @onChange('locale')
  onLocaleChange() {
    locales.init();
  }

  @command({
    name: 'help',
    aliases: ['description'],
    permission: CommandPermission.VIEWERS,
    description: 'commands.help.description',
  })
  async getHelp(opts: CommandOptions) {
    if (!opts.argument?.length) return;

    const command = cache.commands.get(opts.argument) || cache.commandsAliases.get(opts.argument);

    if (!command) {
      return locales.translate('commands.help.commandNotFound', opts.argument);
    }

    const description = command.description;

    if (!description) {
      return locales.translate('commands.help.hasNoDescription', opts.argument);
    }

    return locales.translate('commands.help.response', opts.argument, description);
  }
}

export default new General();
