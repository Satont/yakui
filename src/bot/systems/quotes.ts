import { CommandOptions } from 'typings';
import { prisma } from '@bot/libs/db';
import { command } from '../decorators/command';
import cache from '../libs/cache';
import { randomInt } from 'crypto';
import { CommandPermission } from '@prisma/client';

class QuotesSytem {
  @command({
    name: 'qoute',
    visible: false,
    aliases: ['paste', 'паста'],
  })
  qoute() {
    const text = cache.quotes.get([...cache.quotes.keys()][randomInt(cache.quotes.size)])?.text;

    return text;
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
      return `Quote with id ${opts.argument} now found.`;
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
