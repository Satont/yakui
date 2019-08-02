const { say } = require('../systems/customCommands')
const { setTitle } = require('../systems/twitch')

module.exports = {
  name: 'title',
  visible: false,
  async run(command, message, userstate) {
    message = message.split(' '); message.shift(); message = message.join(' ')
    try {
      await setTitle(message)
      say(`${userstate.username} ===> ${message}`)
    } catch (e) {
      console.log(e)
      say(`${userstate.username} !!! ERROR`)
    }
  }
}