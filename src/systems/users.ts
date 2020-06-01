import { System } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import User from '../models/User'

export default new class Users implements System {
  parsers = [
    { fnc: this.parseMessage }
  ]

  async parseMessage(message: string, raw: TwitchPrivateMessage) {
    const [id, username] = [raw.userInfo.userId, raw.userInfo.userName]

    const [user]: [User] = await User.findOrBuild({
      where: { id },
      defaults: { id, username }
    })

    user.update({ username })
    user.increment('messages')
  }
}
