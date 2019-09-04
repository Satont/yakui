module.exports = (userstate, message) => {
  const isCommand = message.startsWith('!') ? true : false
  for (let system of global.systems) {
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