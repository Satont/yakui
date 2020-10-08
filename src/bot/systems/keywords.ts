import { System, ParserOptions } from '@src/typings'
import tmi from '@bot/libs/tmi'
import variables from './variables'
import { isRegExp } from 'lodash'
import cache from '@bot/libs/cache'

export default new class Keywords implements System {
  parsers = [
    { fnc: this.parser },
  ]
  cooldowns: string[] = []


  async parser(opts: ParserOptions) {
    opts.message = opts.message.toLowerCase()
    const keywords = [...cache.keywords.values()]

    for (const item of keywords) {
      if (!item.enabled || this.cooldowns.includes(item.name)) continue
      let founded = false

      if (isRegExp(item.name) && opts.message.match(item.name)) {
        const message = await variables.parseMessage({ message: item.response, raw: opts.raw })
        tmi.say({ message })
        founded = true
      } else if (opts.message.includes(item.name)) {
        const message = await variables.parseMessage({ message: item.response, raw: opts.raw })

        tmi.say({ message })
        founded = true
      } else continue

      if (founded && item.cooldown && item.cooldown !== 0) {
        this.cooldowns.push(item.name)
        setTimeout(() => this.cooldowns.splice(this.cooldowns.indexOf(item.name), 1), item.cooldown * 1000)
      }
    }
  }
}
