import { CommandOptions } from 'typings';
import { prisma } from '@bot/libs/db';
import { command } from '../decorators/command';
import cache from '../libs/cache';
import { randomInt } from 'crypto';
import { CommandPermission } from '@prisma/client';
import general from '../settings/general';

class QuotesSytem {
  @command({
    name: 'quote',
    visible: false,
    aliases: ['paste', 'паста'],
  })
  async qoute(opts: CommandOptions) {
    const id = opts.argument.length ? opts.argument : randomInt(cache.quotes.size).toString();
    const quote = cache.quotes.get(id);
    
    if (quote) {
      prisma.quotes.update({
        where: {
          id: quote.id,
        },
        data: {
          used: {
            increment: 1,
          },
        },
      });
    }

    return quote?.text;
  }

  @command({
    name: 'quote list',
    visible: false,
    aliases: ['paste list', 'пасты'],
  })
  quotes() {
    return `${general.siteUrl}/public/#/quotes`;
  }

  @command({
    name: 'quote add',
    aliases: ['paste add', 'новая паста'],
    visible: false,
    permission: CommandPermission.MODERATORS,
  })
  async quoteAdd(opts: CommandOptions) {
    if (!opts.argument?.length) {
      return 'You should write quote.';
    } 

    const quote = await prisma.quotes.create({
      data: {
        text: opts.argument,
        authorId: Number(opts.raw.userInfo.userId),
      },
    });

    cache.updateQuotes();
    return `Quote was added with id: ${quote.id}. You can get quote by !quoute ${quote.id}`;
  }

  @command({
    name: 'quote remove',
    aliases: ['paste remove', 'удалить пасту'],
    visible: false,
    permission: CommandPermission.MODERATORS,
  })
  async quoteRemove(opts: CommandOptions) {
    if (!opts.argument?.length) {
      return 'You should write quote id.';
    }

    const quote = await prisma.quotes.findFirst({
      where: {
        id: Number(opts.argument),
      },
    });

    if (!quote) {
      return `Quote with id ${opts.argument} not found.`;
    }

    await prisma.quotes.delete({ 
      where: { 
        id: Number(opts.argument),
      },
    });

    
    cache.updateQuotes();
    return `Quote with id ${opts.argument} was deleted.`;
  }
}

export default new QuotesSytem();
