import { System } from 'typings';
import tmi from '@bot/libs/tmi';
import twitch from './twitch';
import variables from './variables';
import { prisma } from '@bot/libs/db';
import { Timers } from '@prisma/client';

class TimersSystem implements System {
  timers: Timers[] = [];
  timeout: NodeJS.Timeout;

  async init() {
    await prisma.timers.updateMany({
      data: {
        last: 0,
        triggerTimeStamp: Date.now(),
        triggerMessage: 0,
      },
    });

    this.timers = await prisma.timers.findMany();
    this.process();
  }

  async process() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.process(), 10000);
    if (!twitch.streamMetaData?.startedAt) return;
    for (const timer of this.timers.filter((t) => t.enabled)) {
      if (timer.messages > 0 && timer.triggerMessage - tmi.parsedLinesPerStream + timer.messages > 0) {
        continue;
      }
      if (timer.interval > 0 && Date.now() - Number(timer.triggerTimeStamp) < timer.interval * 1000) {
        continue;
      }

      const message = await variables.parseMessage({ message: timer.responses[timer.last] });
      tmi.say({ message });
      prisma.timers.update({
        where: { id: timer.id },
        data: {
          last: ++timer.last % JSON.parse(timer.responses as string).length,
          triggerTimeStamp: BigInt(Date.now()),
          triggerMessage: tmi.parsedLinesPerStream,
        },
      });
    }
  }
}

export default new TimersSystem();
