import { System } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'

export default new class Test implements System {
  parsers = [
    { fnc: this.parseMessage }
  ]

  async parseMessage(message: string, raw: TwitchPrivateMessage) {
    
  }
}
