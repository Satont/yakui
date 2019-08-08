const { getSuggestedGame, setGame } = require('../systems/twitch')
const { say } = require('../systems/customCommands')

module.exports = {
  name: 'game',
  visible: false,
  async run(command, message, userstate) {
    message = message.split(' '); message.shift(); message = message.join(' ')
    try {
      let find = await getSuggestedGame(message)
      await setGame(find)
      say(`${userstate.username} ===> ${find}`)
    } catch (e) {
      await setGame(message)
      say(`${userstate.username} !!! Game wasn't found on twitch, but setted to ${message}`)
    }
  }
}