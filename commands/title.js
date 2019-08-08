const { say } = require('../systems/customCommands')
const { setTitle } = require('../systems/twitch')
const permissions = require('../libs/permissions')

module.exports = {
  name: 'title',
  visible: false,
  permission: 'moderator',
  async run(command, message, userstate) {
    message = message.split(' '); message.shift(); message = message.join(' ')
    if (!permissions.hasPerm(userstate.badges, this.permission) || !message.length) {
      return say(`${userstate.username} ${global.tmi.streamData.channel.status}`)
    }

    try {
      await setTitle(message)
      say(`${userstate.username} ===> ${message}`)
    } catch (e) {
      console.log(e)
      say(`${userstate.username} !!! ERROR`)
    }
  }
}