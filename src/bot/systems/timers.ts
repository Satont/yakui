import { System } from 'typings'
import tmi from '@bot/libs/tmi'
import Timer from '@bot/models/Timer'
import twitch from './twitch'
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
  }

  async process() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.process(), 10000)

    for (const timer of this.timers) {
      if (!timer.enabled || !twitch.streamMetaData?.startedAt) continue

      if ((Date.now() - timer.triggerTimeStamp) > timer.interval * 1000) {

        const message = await variables.parseMessage({ message: timer.responses[timer.last] })
        tmi.say({ message })
        timer.update({ last: ++timer.last % timer.responses.length, triggerTimeStamp: Date.now() })
      }
    }
  }

  listenDbUpdates() {
    Timer.afterSave(() => this.init())
    Timer.afterDestroy(() => this.init())
  }
}
