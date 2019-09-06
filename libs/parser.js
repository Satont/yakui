const _ = require('lodash')
let cooldowns = []

module.exports = (userstate, message) => {
  const isCommand = message.startsWith('!') ? true : false
  for (let [, system] of Object.entries(global.systems)) {
    if (typeof system.commands !== 'undefined' && isCommand) {
      for (let command of system.commands) {
        let msg = message.replace('!', '').trim()
        if (!msg.startsWith(command.name)) continue // skip command if name not found

        if (typeof command.cooldown === 'undefined' || typeof command.cooldownper === 'undefined') {
          userstate['message-type'] = 'chat'
        }
        else if (cooldowns.some(o => o.id === command.id) && command.cooldowntype === 'stop') {
          return global.log.info(`COMMAND ${find.name.toUpperCase()} ON COOLDOWN AND HAS NO EXECUTE MODEL`)
        }
        else if (cooldowns.some(o => o.id === command.id) && (userstate.mod || userstate.subscriber)) {
          userstate['message-type'] = 'chat'
        } else if (cooldowns.some(o => o.id === command.id) && command.cooldowntype === 'notstop' && command.cooldowper !== 'user') {
          userstate['message-type'] = 'whisper'
        } else if (command.cooldownper === 'user') {
          cooldowns.push({ id: command.id, type: 'user' })
          break; /// we don't want to execute command if command cooldown type is for user
        }
        else cooldowns.push({ id: command.id, type: 'global' })

        command['fnc'].apply(system, [userstate, msg.replace(command.name, '').trim(), command.response || null])
        setTimeout(() => _.remove(cooldowns, o => o === command.id), command.cooldown * 1000)
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