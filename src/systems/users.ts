import { System } from '../typings'
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import User from '../models/User'
import tmi from '../libs/tmi'
import { literal } from 'sequelize'
import UserTips from '../models/UserTips'
import UserBits from '../models/UserBits'

export default new class Users implements System {
  parsers = [
    { fnc: this.parseMessage }
  ]

  async parseMessage(message: string, raw: TwitchPrivateMessage) {
    const [id, username] = [raw.userInfo.userId, raw.userInfo.userName]

    const [user, created]: [User, boolean] = await User.findOrCreate({
      where: { id },
      defaults: { id, username, messages: 1 }
    })

    if (!created) {
      user.update({ username, messages: literal('messages + 1') })
    }
  }

  async getUserStats({ id, username }: { id?: string, username?: string }): Promise<User> {
    if (!id && !username) throw new Error('Id or username should be used.')

    if (!id) {
      const byName = await tmi?.clients?.bot?.helix.users.getUserByName(username)
      id = byName.id
    }

    let user = await User.findOne({ 
      where: { id },
      include: [UserTips, UserBits],
      attributes: { include: ['totalTips', 'totalTips' ]},
    })
    
    if (!user) user = await User.create({
      id,
      username
    }, { include: [UserTips, UserBits] })

    return user
  }
}
