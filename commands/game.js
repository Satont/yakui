const { getSuggestedGame, setGame } = require('../systems/twitch')
const { say } = require('../systems/customCommands')
const permissions = require('../libs/permissions')

module.exports = {
  name: 'game',
  visible: false,
  permission: 'moderator',
  async run(command, message, userstate) {
    message = message.split(' '); message.shift(); message = message.join(' ')

    if (!permissions.hasPerm(userstate.badges, this.permission) || !message.length) {
      return say(`${userstate.username} ${global.tmi.streamData.game}`)
    }

    try {
      let find = await getSuggestedGame(message)
      await setGame(find)
      say(`${userstate.username} ===> ${find}`)
      global.tmi.getChannelInfo()
    } catch (e) {
      await setGame(message)
      say(`${userstate.username} !!! Game wasn't found on twitch, but setted to ${message}`)
    }
  }
}