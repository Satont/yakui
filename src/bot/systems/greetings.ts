import { System, ParserOptions } from "typings";
import Settings from "../models/Settings";
import Greeting from "../models/Greeting";
import variables from "./variables";
import tmi from "../libs/tmi";

export default new class Greetings implements System {
  sended: string[] = []
  parsers = [
    { fnc: this.parser }
  ]
  greetings: Greeting[] = []

  async init() {
    const greetings = await Greeting.findAll()

    this.greetings = greetings
  }

  async parser(opts: ParserOptions) {
    if (!this.greetings.length) return

    const user = this.greetings.find(user => user.userId === Number(opts.raw.userInfo.userId) || user.username === opts.raw.userInfo.userName)
    if (!user || !user?.enabled) return
    if (this.sended.includes(opts.raw.userInfo.userName)) return
    this.sended.push(opts.raw.userInfo.userName)

    const message = await variables.parseMessage({ message: user.message, raw: opts.raw })

    tmi.say({ message })
  }

  listenDbUpdates() {
    Settings.afterSave(instance => {
      if (instance.space !== 'greetings') return

      this.init()
    })
    Greeting.afterSave(() => this.init())
    Greeting.afterDestroy(() => this.init())
  }

  onStreamEnd() {
    this.sended = []
  }
  onStreamStart() {
    this.sended = []
  }
}