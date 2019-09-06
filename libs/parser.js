const _ = require('lodash')
let cooldowns = []

module.exports = (userstate, message) => {
  const isCommand = message.startsWith('!') ? true : false
  for (let [, system] of Object.entries(global.systems)) {
    if (typeof system.commands !== 'undefined' && isCommand) {
      for (let command of system.commands) {
        let msg = message.replace('!', '').trim()

        command.names = command.aliases ? command.aliases : []
        command.names.push(command.name)

        if (!command.names.some(o => msg.startsWith(o))) continue // skip command if name not found
        if (typeof command.cooldown === 'undefined' || typeof command.cooldownfor === 'undefined') {
          userstate['message-type'] = 'chat'
        }
        else if (cooldowns.some(o => o.id === command.id) && command.cooldowntype === 'stop' && command.cooldownfor === 'global') {
          return global.log.info(`COMMAND ${command.name.toUpperCase()} ON COOLDOWN AND HAS NO EXECUTE MODEL`)
        }
        else if (cooldowns.some(o => o.id === command.id && o.user === userstate.username) && command.cooldowntype === 'stop' && command.cooldownfor ==='user') {
          return global.log.info(`COMMAND ${command.name.toUpperCase()} ON COOLDOWN FOR USER ${userstate.username} AND HAS NO EXECUTE MODEL`)
        }
        else if (cooldowns.some(o => o.id === command.id) && (userstate.mod || userstate.subscriber)) {
          userstate['message-type'] = 'chat'
        } else if (cooldowns.some(o => o.id === command.id) && command.cooldowntype === 'notstop' && command.cooldownfor !== 'user') {
          userstate['message-type'] = 'whisper'
        } else if (cooldowns.some(o => o.id === command.id && o.user === userstate.username) && command.cooldownfor === 'user') {
          break;
        }
        cooldowns.push({ id: command.id, type: command.cooldownfor, user: userstate.username })

        for (const item of command.names) {
          if (new RegExp("\\b" + item + "\\b").test(message)) {
            msg = msg.replace(item, '').trim()
          }
        }

        command['fnc'].apply(system, [userstate, msg.trim(), command.response || null])
        setTimeout(() => _.remove(cooldowns, o => o.id === command.id), command.cooldown * 1000)
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