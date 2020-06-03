import { System } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import tmi from '../libs/tmi'

export default new class Test implements System {
  parsers = [
    { fnc: this.testFnc }
  ]
  commands = [
    { name: 'test', fnc: this.testCommand, cooldown: 30 }
  ]

  async testCommand() {
    return 'qwe'
  }

  async testFnc(message: string, raw: TwitchPrivateMessage) {
    //tmi.say({ message })
  }
}
