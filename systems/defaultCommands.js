const fs = require('fs')
const permissions = require('../libs/permissions')

class DefaulCommands {
  constructor () {
    this.commands = new Map()
    this.load()
  }

  async load () {
    const { getDefaultCommandPermission } = require('../libs/permissions')

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      const command = require(`../commands/${file}`)
      command.permission = await getDefaultCommandPermission(command.name)
      this.commands.set(command.name, command)
      console.log(`COMMAND ${command.name.toUpperCase()} LOADED`)
    }
  }

  async onMessage (userstate, message) {
    if (!message.toLowerCase().startsWith('!')) return
    let command = message.toLowerCase().substring(1).split(' ')[0]
    if (this.commands.has(command)) {
      command = this.commands.get(command)
      if (!(await permissions.hasPerm(userstate.badges, command.permission))) return
      return command.run(command, message, userstate)
    } 
  }
}

module.exports = new DefaulCommands()
