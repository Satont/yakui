import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import safeEval from 'safe-eval'
import axios from 'axios'
import _ from 'lodash'
import User from '@bot/models/User'
import tmi from '@bot/libs/tmi'

export default async ({ raw, message, param }: { raw: TwitchPrivateMessage, message: string, param: string }) => {
  const toEval = `(async function evaluation () { ${message} })()`
  const context = {
    axios,
    sender: raw.userInfo.userName,
    param,
    _,
    user: await User.findOne({ where: { id: raw.userInfo.userId }}) || {},
    say: (message: string) => tmi.say({ message }),
    timeout: (username, duration) => tmi.timeout({ username, duration }),
  }

  const run = await safeEval(toEval, context)
  return run.toString()
}
