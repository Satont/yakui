import { System } from 'typings';
import tmi from '@bot/libs/tmi';
import { Timer } from '@bot/entities/Timer';
import twitch from './twitch';
import variables from './variables';
import { orm } from '@bot/libs/db';

export default new class Timers implements System {
  timers: Timer[] = []
  timeout: NodeJS.Timeout

  async init() {
    const timers = await orm.em.fork().getRepository(Timer).findAll();

    for (const timer of timers) {
      timer.last = 0;
      timer.triggerTimeStamp = Date.now();
      timer.triggerMessage = 0;
    }

    await orm.em.fork().persistAndFlush(timers);

    this.timers = timers;

    this.process();
  }

  async process() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.process(), 10000);
    if (!twitch.streamMetaData?.startedAt) return;
    for (const timer of this.timers.filter(t => t.enabled)) {
      if (timer.messages > 0 && (timer.triggerMessage - tmi.parsedLinesPerStream + timer.messages) > 0) {
        continue;
      }
      if (timer.interval > 0 && (Date.now() - timer.triggerTimeStamp) < timer.interval * 1000) {
        continue;
      }

      const message = await variables.parseMessage({ message: timer.responses[timer.last] });
      tmi.say({ message });
      timer.last = ++timer.last % timer.responses.length;
      timer.triggerTimeStamp = Date.now();
      timer.triggerMessage = tmi.parsedLinesPerStream;
      await orm.em.fork().getRepository(Timer).persistAndFlush(timer);
    }
  }
};
