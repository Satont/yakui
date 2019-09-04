
const { say } = require('./customCommands')


class CoreCommands {
  commands = [
    { name: 'help', visible: true, description: 'shows command description. Usage: !help commandname.', fnc: this.help }
  ]
  async help (userstate, message) {
    if (!message.length) return say(`@${userstate['display-name']} shows command description. Usage: !help commandname. `)
    for (let [, system] of Object.entries(global.systems)) {
      if (typeof system.commands === 'undefined') continue
      const command = system.commands.find(o => o.name === message || (o.aliases && o.aliases.includes(message)))
      if (!command || typeof command.description === 'undefined') continue
      say(`@${userstate['display-name']} ${command.description}`)
      break;
    }
  }
}

module.exports = new CoreCommands()
