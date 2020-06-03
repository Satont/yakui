import { System } from '../typings'
import tmi from '../libs/tmi'
import Timer from '../models/Timer'
import twitch from '../libs/twitch'
import variables from './variables'

export default new class Timers implements System {
  timers: Timer[] = []
  timeout: NodeJS.Timeout

  async init() {
    const timers: Timer[] = await Timer.findAll()

    for (const timer of timers) {
      await timer.update({ last: 0, triggerTimeStamp: Date.now() })
    }

    this.timers = timers

    this.process()

    Timer.afterCreate(() => this.init())
    Timer.afterDestroy(() => this.init())
    Timer.afterUpdate(() => this.init())
  }

  async process() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.process(), 10000)

    for (const timer of this.timers) {
      if (!timer.enabled || !twitch.streamMetaData?.startedAt) continue

      if ((Date.now() - timer.triggerTimeStamp) > timer.interval * 1000) {

        const message = await variables.parseMessage(timer.responses[timer.last])
        tmi.say({ message })
        await timer.update({ last: ++timer.last % timer.responses.length, triggerTimeStamp: Date.now() })
      }
    }
  }
}
