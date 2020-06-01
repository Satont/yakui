import { System } from '../typings'
import tmi from '../libs/tmi'
import Timer from '../models/Timer'
import cache from '../libs/cache'
import variables from './variables'

export default new class Timers implements System {
  timers: Timer[] = []
  timeout: NodeJS.Timeout

  async init() {
    const timers: Timer[] = await Timer.findAll()

    for (const timer of timers) {
      await timer.update({ last: 0, triggerTimeStamp: new Date().getTime() })
      this.timers.push(timer)
    }
  }

  async process() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.process(), 10000)

    for (const timer of this.timers) {
      if ((new Date().getTime() - timer.triggerTimeStamp) > timer.interval * 1000) {
        if (!cache.streamMetaData?.startedAt) continue

        const message = await variables.parseMessage(timer.responses[timer.last])
        tmi.say({ message })
        await timer.update({ last: ++timer.last % timer.responses.length, triggerTimeStamp: new Date().getTime() })
      }
    }
  }
}
