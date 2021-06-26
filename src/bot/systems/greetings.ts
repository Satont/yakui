import { System, ParserOptions } from 'typings';
import variables from './variables';
import tmi from '@bot/libs/tmi';
import cache from '@bot/libs/cache';
import { parser } from '../decorators/parser';
import alerts from '../overlays/alerts';
import { prisma } from '../libs/db';

class Greetings implements System {
  sended: string[] = [];

  @parser()
  async parse(opts: ParserOptions) {
    if (!cache.greetings.size) return;
    const user = [...cache.greetings.values()].find(
      (user) => user.userId === Number(opts.raw.userInfo.userId) || user.username === opts.raw.userInfo.userName,
    );

    if (!user || !user?.enabled) return;
    if (this.sended.includes(opts.raw.userInfo.userName)) return;
    this.sended.push(opts.raw.userInfo.userName);

    const message = await variables.parseMessage({ message: user.message, raw: opts.raw });

    tmi.say({ message });

    if (user.sound_file) {
      alerts.emitAlert({
        audio: {
          file: user.sound_file,
          volume: user.sound_volume,
        },
      });
    }
  }

  onStreamEnd() {
    this.sended = [];
  }
  onStreamStart() {
    this.sended = [];
  }
}

export default new Greetings();
