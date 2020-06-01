import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'

export default new class Variables {
  async parseMessage(message: string, raw: TwitchPrivateMessage) {
    let result = message

    result = result
      .replace(/\$sender/gimu, '@' + raw.userInfo.userName)

    return result
  }
}
