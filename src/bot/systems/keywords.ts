import { System, ParserOptions } from "typings";
import Keyword from '@bot/models/Keyword'
import tmi from "@bot/libs/tmi";
import variables from './variables'
import { isRegExp } from 'lodash'

export default new class Keywords implements System {
  keywords: Array<{ name: string, response: string, cooldown?: number, enabled: boolean }> = []
  parsers = [
    { fnc: this.parser }
  ]
  cooldowns: string[] = []

  async init() {
    const keywords: Keyword[] = await Keyword.findAll()

    this.keywords = keywords.map(keyword => ({
      name: keyword.name.toLowerCase(),
      response: keyword.response,
      cooldown: keyword.cooldown,
      enabled: keyword.enabled
    }))
  }

  async parser(opts: ParserOptions) {
    opts.message = opts.message.toLowerCase()

    for (const item of this.keywords) {
      if (!item.enabled || this.cooldowns.includes(item.name)) continue
      let founded = false

      if (isRegExp(item.name) && opts.message.match(item.name)) {
        const message = await variables.parseMessage({ message: item.response, raw: opts.raw })
        tmi.say({ message})
        founded = true
      } else if (opts.message.includes(item.name)) {
        const message = await variables.parseMessage({ message: item.response, raw: opts.raw })

        tmi.say({ message})
        founded = true
      } else continue

      if (founded && item.cooldown && item.cooldown !== 0) {
        this.cooldowns.push(item.name)
        setTimeout(() => this.cooldowns.splice(this.cooldowns.indexOf(item.name), 1), item.cooldown * 1000);
      }
    }
  }
}
