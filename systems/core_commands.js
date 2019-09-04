
const { say } = require('./customCommands')


class CoreCommands {
  commands = [
    { name: 'help', description: 'Shows command description', fnc: this.help }
  ]
  async help (userstate, message) {
    if (!message.length) return
    for (let system of global.systems) {
      if (typeof system.commands === 'undefined') continue
      const command = system.commands.find(o => o.name === message)
      if (!command) continue
      say(`@${userstate['display-name']} ${command.description}`)
      break;
    }
  }
}

module.exports = new CoreCommands()
