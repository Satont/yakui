import { System, ParserOptions } from '@src/typings'
import variables from './variables'
import tmi from '@bot/libs/tmi'
import cache from '@bot/libs/cache'

export default new class Greetings implements System {
  sended: string[] = []
  parsers = [
    { fnc: this.parser },
  ]

  async parser(opts: ParserOptions) {
    if (!cache.greetings.size) return
    const user = [...cache.greetings.values()]
      .find(user => user.userId === Number(opts.raw.userInfo.userId) || user.username === opts.raw.userInfo.userName)


    if (!user || !user?.enabled) return
    if (this.sended.includes(opts.raw.userInfo.userName)) return
    this.sended.push(opts.raw.userInfo.userName)

    const message = await variables.parseMessage({ message: user.message, raw: opts.raw })

    tmi.say({ message })
  }

  onStreamEnd() {
    this.sended = []
  }
  onStreamStart() {
    this.sended = []
  }
}
