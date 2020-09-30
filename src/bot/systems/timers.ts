import { System } from '@src/typings'
import tmi from '@bot/libs/tmi'
import {Timer} from '@bot/entities/Timer'
import twitch from './twitch'
import variables from './variables'
import { orm } from '@bot/libs/db'

export default new class Timers implements System {
  timers: Timer[] = []
  timeout: NodeJS.Timeout

  async init() {
    const timers = await orm.em.getRepository(Timer).findAll()

    for (const timer of timers) {
      timer.last = 0
      timer.triggerTimeStamp = Date.now()
    }

    await orm.em.persistAndFlush(timers)

    this.timers = timers

    this.process()
  }

  async process() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.process(), 10000)

    for (const timer of this.timers) {
      if (!timer.enabled || !twitch.streamMetaData?.startedAt) continue

      if ((Date.now() - timer.triggerTimeStamp) > timer.interval * 1000) {
        const message = await variables.parseMessage({ message: timer.responses[timer.last] })
        tmi.say({ message })
        timer.last = ++timer.last % timer.responses.length
        timer.triggerTimeStamp = Date.now()
        orm.em.getRepository(Timer).persistAndFlush(timer)
      }
    }
  }
}
