const _ = require('lodash')
const permissions = require('../libs/permissions')
const { io } = require('../libs/panel')
const variables = require('../systems/variables')

class CustomCommands {
  commands = []
  parsers = [
    { name: 'message', fnc: this.onMessage }
  ]

  constructor () {
    this.cooldowns = []
    this.commands = []
    this.sockets()
    this.getCommands()
  }

  async onMessage (userstate, message) {
    if (!message.startsWith('!')) return
    message = message.replace('!', '').trim()
    let find
    const ar = message.toLowerCase().split(' ')
    for (let i = 0, len = ar.length; i < len; i++) {
      const command = this.commands.find(o => o.name === ar.join(' '))
      const aliase = this.commands.find(o => o.aliases.includes(ar.join(' ')))
      if (!command && !aliase) ar.pop()
      else {
        find = command || aliase
        break
      }
    }
    if (!find) return

    if (!permissions.hasPerm(userstate.badges, find.permission)) return

    if (this.cooldowns.includes(find.name) && find.cooldowntype === 'stop') {
      return global.log.info(`COMMAND ${find.name.toUpperCase()} ON COOLDOWN AND HAS NO EXECUTE MODEL`)
    }
    if (this.cooldowns.includes(find.name) && (userstate.mod || userstate.subscriber)) {
      userstate['message-type'] = 'chat'
    } else if (this.cooldowns.includes(find.name) && find.cooldowntype === 'notstop') {
      userstate['message-type'] = 'whisper'
    } else this.cooldowns.push(find.name)
    
    for (const item of _.concat(find.aliases, find.name)) {
      if (new RegExp("\\b" + item + "\\b").test(message)) {
        message = message.replace(item, '').trim()
      }
    }
    message = message.trim()

    this.prepareMessage(find.response, message, userstate)

    setTimeout(() => {
      const index = this.cooldowns.indexOf(find.name)
      if (index !== -1) this.cooldowns.splice(index, 1)
    }, find.cooldown * 1000)
  }

  async prepareMessage (response, message, userstate) {
    const variableRegexp = /\$_(\S*)/g
    // модер меняет переменную в команде
    const wantsChangeVariable = (userstate.mod || (userstate.badges && typeof userstate.badges.broadcaster !== 'undefined')) && message.length && response.match(variableRegexp) !== null
    if (wantsChangeVariable) {
      const variable = response.match(variableRegexp)[0].replace('$_', '')
      const findVariable = await global.db('systems.variables').where('name', variable).update('value', message)
      if (findVariable) return this.say(`@${userstate['display-name']} ${variable} ===> ${message}`)
    }
    //
    response = await variables.prepareMessage(response, userstate, message)
    //
    this.respond(response, userstate)
  }

  async respond (response, userstate) {
    if (userstate['message-type'] === 'whisper') this.whisper(userstate.username, response)
    else this.say(response)
  }

  async getCommands () {
    const query = await global.db.select(`*`).from('systems.commands')
    this.commands = query
    return query
  }

  async say (msg) {
    global.log.chatOut(msg)
    if (process.env.NODE_ENV !== 'production') return
    global.tmi.client.say(process.env.TWITCH_CHANNEL, msg).catch(global.log.error)
  }

  async whisper (username, message) {
    global.log.chatOut(username, message)
    if (process.env.NODE_ENV !== 'production') return
    await global.tmi.client.whisper(username, message).catch(global.log.error)
  }

  async timeout (username, time) {
    global.log.chatOut(username, time)
    if (process.env.NODE_ENV !== 'production') return
    global.tmi.client.timeout(process.env.TWITCH_CHANNEL, username, time).catch(global.log.error)
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('list.commands', async (data, cb) => {
        const query = await global.db.select(`*`).from('systems.commands')
        cb(null, query)
      })
      socket.on('create.command', async (data, cb) => {
        const aliases = _.flattenDeep(self.commands.map(o => o.aliases))
        const names = self.commands.map(o => o.name)

        if (aliases.some(o => data.aliases.includes(o)) || names.some(o => data.aliases.includes(o))) return cb('Command name or aliase already used', null)
        if (names.some(o => o.name === data.name) || aliases.some(o => names.includes(o))) return cb('Command name or aliase already used', null)

        try {
          await global.db('systems.commands').insert(data)
          await self.getCommands()
          cb(null, true)
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('delete.command', async (data, cb) => {
        try {
          await global.db('systems.commands').where('name', data).delete()
          await self.getCommands()
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('update.command', async (data, cb) => {
        const aliases = _.flattenDeep(self.commands.filter(o => o.name !== data.currentname).map(o => o.aliases))
        const names = self.commands.map(o => o.name).filter(o => o !== data.currentname)

        if (aliases.some(o => data.aliases.includes(o)) || names.some(o => data.aliases.includes(o))) return cb('Command name or aliase already used', null)
        if (names.some(o => o.name === data.name) || aliases.some(o => names.includes(o))) return cb('Command name or aliase already used', null)

        try {
          await global.db('systems.commands').where('id', data.id).update(data)
          await self.getCommands()
          cb(null, true)
        } catch (e) {
          global.log.error(e)
        }
      })
    })
  }
}

module.exports = new CustomCommands()
