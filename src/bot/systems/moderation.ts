import { System, Command, CommandOptions } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { ParseOptions } from 'querystring'

export default new class Test implements System {
  parsers = [
    { fnc: this.parser }
  ]
  commands: Command[] = [
    { name: 'permit', fnc: this.permit, cooldown: 30, permission: 'moderators' }
  ]

  permits: string[] = []

  async permit(opts: CommandOptions) {
    return 'qwe'
  }

  async parser(opts: ParseOptions) {
    
  }
}
