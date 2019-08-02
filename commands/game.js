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
      say(`${userstate.username} !!! ERROR`)
    }
  }
}