const commons = require('./commons')

class Parser {
  constructor () {
    this.loadParsers()
  }
  process (userstate, message) {
    const isCommand = message.startsWith('!') ? true : false
    for (let system of this.systemsList) {
      if (system.constructor.name !== 'CustomCommands' && typeof system.commands !== 'undefined' && isCommand) {
        for (let command of system.commands) {
          let msg = message.replace('!', '').trim()
          if (!msg.startsWith(command.name)) continue // skip command if name not found
          command['fnc'].apply(system, [userstate, msg.replace(command.name, '').trim()])
          break; // stop loop if command was found and axecuted
        }
      } else {
        if (typeof system.parsers === 'undefined') continue
        for (let parser of system.parsers) {
          parser['fnc'].apply(system, [userstate, message])
        }
      } 
    }
  }
  
  async loadParsers () {
    this.systemsList = []
    for (let system of Object.entries(await commons.autoLoad('./systems/'))) {
      this.systemsList.push(system[1])
    }
  }
}

module.exports = new Parser()