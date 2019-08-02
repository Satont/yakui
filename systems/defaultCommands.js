const fs = require('fs')
class DefaulCommands {
  constructor() {
    global.commands = new Map()
    this.load()
  }
  async load() {
    const { getDefaultCommandPermission } = require('../libs/permissions')

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      const command = require(`../commands/${file}`)
      command.permission = await getDefaultCommandPermission(command.name)
      global.commands.set(command.name, command)
      console.log(`COMMAND ${command.name.toUpperCase()} LOADED`)
    }
  }
}

module.exports = new DefaulCommands()